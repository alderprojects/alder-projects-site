/**
 * Search Console Feedback Worker
 *
 * Pulls Search Console performance data weekly, joins it to expansion
 * candidates and published URLs, and writes GscPageStats rows that the
 * daily digest reads.
 *
 * What we get from GSC:
 *   - Impressions per page per query
 *   - Clicks per page per query
 *   - CTR
 *   - Average position
 *
 * What we DON'T get directly (per Google's docs):
 *   - Which queries triggered AI Overviews
 *   - Whether our page was cited as a source
 *
 * What we infer (best available signal):
 *   - aiOverviewLikely = impressions rising AND ctr falling week-over-week
 *     → user got the answer from AI summary without clicking through
 *     → translation: our content is winning at AI summarization
 *
 * Auth model:
 *   Uses a Google service account with read-only access to Search Console.
 *   Credentials in env var GSC_SERVICE_ACCOUNT_JSON (the full JSON contents,
 *   minified). Domain must be verified in Search Console and the service
 *   account email added as a property user with at least "restricted" access.
 *
 *   Setup once: create service account at console.cloud.google.com →
 *   APIs & Services → Credentials. Add Search Console API access. Download
 *   JSON key. Add service account email to alderprojects.com property in
 *   search.google.com/search-console as Property User → Restricted.
 *
 * Cadence: weekly (Mondays at 4:17 AM ET = 9:17 UTC).
 */

import { prisma } from '@/lib/db'

const GSC_API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3'
const SITE_URL = process.env.GSC_SITE_URL || 'https://alderprojects.com/'
const LOOKBACK_DAYS = 7

// =============================================================================
// MAIN
// =============================================================================

export interface GscSyncResult {
  windowStart: Date
  windowEnd: Date
  pagesProcessed: number
  aiOverviewSignals: number
  errors: string[]
  durationMs: number
}

export async function runGscSync(): Promise<GscSyncResult> {
  const startMs = Date.now()
  const errors: string[] = []
  const now = new Date()
  const windowEnd = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // GSC lags 2 days
  const windowStart = new Date(windowEnd.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
  const priorWindowEnd = new Date(windowStart.getTime())
  const priorWindowStart = new Date(priorWindowEnd.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  let accessToken: string
  try {
    accessToken = await getGscAccessToken()
  } catch (e) {
    errors.push(`Auth failed: ${(e as Error).message}`)
    return {
      windowStart,
      windowEnd,
      pagesProcessed: 0,
      aiOverviewSignals: 0,
      errors,
      durationMs: Date.now() - startMs,
    }
  }

  // 1. Pull current window per-page stats
  let currentStats: GscPageData[]
  try {
    currentStats = await fetchPageStats(accessToken, windowStart, windowEnd)
  } catch (e) {
    errors.push(`Current-window fetch failed: ${(e as Error).message}`)
    return {
      windowStart,
      windowEnd,
      pagesProcessed: 0,
      aiOverviewSignals: 0,
      errors,
      durationMs: Date.now() - startMs,
    }
  }

  // 2. Pull prior window for week-over-week comparison
  let priorStats: GscPageData[] = []
  try {
    priorStats = await fetchPageStats(accessToken, priorWindowStart, priorWindowEnd)
  } catch (e) {
    errors.push(`Prior-window fetch failed: ${(e as Error).message} — proceeding without comparison`)
  }
  const priorByUrl = new Map(priorStats.map((p) => [p.page, p]))

  // 3. Compute aiOverviewLikely signal, persist
  let aiOverviewSignals = 0
  for (const stat of currentStats) {
    const prior = priorByUrl.get(stat.page)
    const aiOverviewLikely = isAiOverviewLikely(stat, prior)
    if (aiOverviewLikely) aiOverviewSignals++

    // Look up if this URL was published from an expansion candidate
    const candidate = await findPublishedCandidate(stat.page)

    await prisma.gscPageStats.upsert({
      where: { pageUrl_windowStart: { pageUrl: stat.page, windowStart } },
      create: {
        pageUrl: stat.page,
        windowStart,
        windowEnd,
        impressions: stat.impressions,
        clicks: stat.clicks,
        ctr: stat.ctr,
        avgPosition: stat.position,
        topQueriesJson: stat.topQueries as any,
        aiOverviewLikely,
        publishedFromCandidateId: candidate?.id,
      },
      update: {
        impressions: stat.impressions,
        clicks: stat.clicks,
        ctr: stat.ctr,
        avgPosition: stat.position,
        topQueriesJson: stat.topQueries as any,
        aiOverviewLikely,
        publishedFromCandidateId: candidate?.id,
      },
    })
  }

  await prisma.eventLog.create({
    data: {
      eventType: 'GSC_SYNC_COMPLETED',
      payloadJson: {
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        pagesProcessed: currentStats.length,
        aiOverviewSignals,
        durationMs: Date.now() - startMs,
      },
      source: 'cron',
    },
  })

  return {
    windowStart,
    windowEnd,
    pagesProcessed: currentStats.length,
    aiOverviewSignals,
    errors,
    durationMs: Date.now() - startMs,
  }
}

// =============================================================================
// AI OVERVIEW INFERENCE
// =============================================================================

interface GscPageData {
  page: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  topQueries: Array<{ query: string; impressions: number; clicks: number }>
}

function isAiOverviewLikely(current: GscPageData, prior?: GscPageData): boolean {
  if (!prior) return false
  // Need meaningful traffic to draw an inference
  if (current.impressions < 50) return false

  const impressionGrowth = (current.impressions - prior.impressions) / Math.max(prior.impressions, 1)
  const ctrDelta = current.ctr - prior.ctr

  // Rising impressions (>15%) + falling CTR (drop >0.5 percentage points)
  // = users seeing the result but not clicking → AI Overview summarization
  return impressionGrowth > 0.15 && ctrDelta < -0.005
}

// =============================================================================
// GSC API CLIENT
// =============================================================================

async function fetchPageStats(
  accessToken: string,
  windowStart: Date,
  windowEnd: Date
): Promise<GscPageData[]> {
  const startStr = windowStart.toISOString().slice(0, 10)
  const endStr = windowEnd.toISOString().slice(0, 10)

  // First call: top 100 pages by impressions
  const pageResponse = await fetch(
    `${GSC_API_BASE}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startStr,
        endDate: endStr,
        dimensions: ['page'],
        rowLimit: 100,
      }),
    }
  )

  if (!pageResponse.ok) {
    const text = await pageResponse.text()
    throw new Error(`GSC API ${pageResponse.status}: ${text.substring(0, 200)}`)
  }

  const pageData = (await pageResponse.json()) as GscApiResponse
  const pages = pageData.rows || []

  // Second call per top-page: top queries (for top-10 only, to limit API spend)
  const results: GscPageData[] = []
  for (const row of pages) {
    const pageUrl = row.keys[0]
    const topPages = pages.slice(0, 10).some((p) => p.keys[0] === pageUrl)

    let topQueries: GscPageData['topQueries'] = []
    if (topPages) {
      try {
        const queryResponse = await fetch(
          `${GSC_API_BASE}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startDate: startStr,
              endDate: endStr,
              dimensions: ['query'],
              dimensionFilterGroups: [
                {
                  filters: [{ dimension: 'page', operator: 'equals', expression: pageUrl }],
                },
              ],
              rowLimit: 5,
            }),
          }
        )
        if (queryResponse.ok) {
          const queryData = (await queryResponse.json()) as GscApiResponse
          topQueries = (queryData.rows || []).map((q) => ({
            query: q.keys[0],
            impressions: q.impressions,
            clicks: q.clicks,
          }))
        }
      } catch (e) {
        // Non-fatal — page stats still write without query detail
        console.warn(`Failed to fetch queries for ${pageUrl}:`, e)
      }
    }

    results.push({
      page: pageUrl,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
      topQueries,
    })
  }

  return results
}

interface GscApiResponse {
  rows?: Array<{
    keys: string[]
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
}

// =============================================================================
// SERVICE ACCOUNT AUTH (Google OAuth 2.0 JWT bearer flow)
// =============================================================================

async function getGscAccessToken(): Promise<string> {
  const credsJson = process.env.GSC_SERVICE_ACCOUNT_JSON
  if (!credsJson) {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON not configured')
  }

  const creds = JSON.parse(credsJson) as ServiceAccountCreds

  // Build the JWT
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const encode = (obj: any) => base64UrlEncode(Buffer.from(JSON.stringify(obj)))
  const unsigned = `${encode(header)}.${encode(claims)}`
  const signature = await signWithPrivateKey(unsigned, creds.private_key)
  const jwt = `${unsigned}.${signature}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text()
    throw new Error(`Token exchange failed: ${tokenResponse.status} ${text.substring(0, 200)}`)
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string }
  return tokenData.access_token
}

interface ServiceAccountCreds {
  client_email: string
  private_key: string
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function signWithPrivateKey(data: string, privateKeyPem: string): Promise<string> {
  // Use Node's crypto module via dynamic import to avoid Edge runtime issues.
  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(data)
  sign.end()
  const signature = sign.sign(privateKeyPem)
  return base64UrlEncode(signature)
}

// =============================================================================
// CANDIDATE JOIN
// =============================================================================

async function findPublishedCandidate(pageUrl: string) {
  // Look up if this URL was created by a CatalogExpansionCandidate. The
  // publishedAsJson on a published candidate contains the URL or path
  // pattern. For now, a simple lookup; tighten the matching later.
  const candidates = await prisma.catalogExpansionCandidate.findMany({
    where: {
      status: 'published',
      publishedAsJson: { not: undefined },
    },
    take: 100,
    orderBy: { publishedAt: 'desc' },
  })

  for (const c of candidates) {
    const published = c.publishedAsJson as { url?: string } | null
    if (published?.url && pageUrl.includes(published.url)) {
      return c
    }
  }
  return null
}
