/**
 * Alder Read v1 — Catalog Price Refresh Cron
 *
 * Purpose: keep the Smart Cart universe accurate on price, availability,
 * and affiliate link health. Runs twice daily (6 AM and 6 PM ET).
 *
 * Why this matters more than it looks:
 *   - A cart that quotes $24.99 and links to a $34.99 listing destroys
 *     trust on the first click, silently. No error fires.
 *   - ASINs go out of stock or get deprecated — affiliate links still
 *     resolve but to the wrong product.
 *   - Lightning Deals and seasonal pricing shift continuously on home
 *     improvement SKUs.
 *
 * What it does:
 *   1. Walks every product in the universe (universe.ts).
 *   2. Hits Amazon PA-API 5.0 for each ASIN, batched 10 at a time.
 *   3. Writes a CatalogPriceSnapshot row per product per run.
 *   4. Updates the in-memory universe (and optionally the source file).
 *   5. Emits drift alerts if any threshold is breached.
 *
 * What it does NOT do:
 *   - Doesn't auto-remove products from the universe on availability
 *     loss — that's a manual decision. It flags them.
 *   - Doesn't change tier assignments (budget/sweet_spot/premium) — the
 *     editorial layer owns those.
 *   - Doesn't refresh non-Amazon SKUs. Local hardware stores, direct-
 *     buy products, and other affiliate networks need their own workers.
 *
 * Environment variables required:
 *   AMAZON_PAAPI_ACCESS_KEY
 *   AMAZON_PAAPI_SECRET_KEY
 *   AMAZON_PAAPI_ASSOCIATE_TAG  (e.g. "alderprojects-20" for prod,
 *                                "alderstaging-20" for staging)
 *   AMAZON_PAAPI_REGION         (default: "us-east-1")
 *   RESEND_API_KEY              (for email digest alerts)
 *   ALERT_EMAIL                 (recipient of drift digests)
 *   ALERT_FROM_EMAIL            (optional, default alerts@alderprojects.com)
 *   CATALOG_OBSERVE_ONLY        ("true" for weeks 1-2 read-only mode,
 *                                "false" to activate writes)
 *
 * Scheduling on Vercel:
 *   Add to vercel.json:
 *     {
 *       "crons": [
 *         { "path": "/api/cron/catalog-refresh", "schedule": "0 11,23 * * *" }
 *       ]
 *     }
 *   (11:00 and 23:00 UTC = 6 AM and 6 PM ET during EST)
 *
 * Run manually from the CLI:
 *   npx tsx scripts/catalog-refresh.ts --dry-run
 *   npx tsx scripts/catalog-refresh.ts --write
 */

import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// =============================================================================
// CONFIG
// =============================================================================

const PAAPI_HOST = 'webservices.amazon.com'
const PAAPI_URI = '/paapi5/getitems'
const PAAPI_REGION = process.env.AMAZON_PAAPI_REGION || 'us-east-1'
const PAAPI_SERVICE = 'ProductAdvertisingAPI'
const PAAPI_TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'

const BATCH_SIZE = 10 // PA-API GetItems max is 10 ASINs per request
const BATCH_DELAY_MS = 1100 // PA-API rate limit: 1 req/sec for most accounts
const MAX_RETRIES = 3

// Drift thresholds — see header doc for rationale
const PRICE_DRIFT_ALERT_PCT = 15 // single product, 12h window
const PRICE_DRIFT_BULK_PCT = 10 // any product, used in bulk count
const PRICE_DRIFT_BULK_FRACTION = 0.05 // 5% of catalog
const PRICE_UPDATE_THRESHOLD_PCT = 5 // only persist if move >5%

// Observe-only mode (weeks 1-2 of Read v1 build): cron writes
// CatalogPriceSnapshot rows and sends email digests, but does NOT
// update the universe source file or any CatalogProduct table.
// Decision to flip to write mode happens end of week 2 once we've
// seen real drift patterns. Set OBSERVE_ONLY=false to activate writes.
const OBSERVE_ONLY = process.env.CATALOG_OBSERVE_ONLY !== 'false'

// =============================================================================
// TYPES
// =============================================================================

interface UniverseProduct {
  universeId: string
  productName: string
  amazonAsin: string | null
  affiliateUrl: string
  priceLow: number
  priceHigh: number
  tier: 'budget' | 'sweet_spot' | 'premium'
}

interface PaapiResult {
  asin: string
  priceLow: number | null
  priceHigh: number | null
  availability: 'in_stock' | 'limited' | 'out_of_stock' | 'unknown'
  title: string | null
  detailPageUrl: string | null
  errors: string[]
}

interface DriftEvent {
  asin: string
  productName: string
  kind: 'price_jump' | 'price_drop' | 'unavailable' | 'asin_not_found' | 'url_redirect'
  oldValue: string
  newValue: string
  pctChange?: number
}

interface RunSummary {
  startedAt: Date
  finishedAt: Date
  productsTotal: number
  productsRefreshed: number
  productsFailed: number
  pricesUpdated: number
  driftEvents: DriftEvent[]
  apiCostEstimateCents: number
  bulkDriftDetected: boolean
}

// =============================================================================
// MAIN
// =============================================================================

export async function runCatalogRefresh(opts: { dryRun: boolean; write: boolean }): Promise<RunSummary> {
  const startedAt = new Date()
  const summary: RunSummary = {
    startedAt,
    finishedAt: startedAt,
    productsTotal: 0,
    productsRefreshed: 0,
    productsFailed: 0,
    pricesUpdated: 0,
    driftEvents: [],
    apiCostEstimateCents: 0,
    bulkDriftDetected: false,
  }

  // 1. Load the universe — in production this reads from the source file
  // or a DB table; in this skeleton it's pulled from a function in the
  // codebase. The source-of-truth choice (file vs DB) is a separate decision.
  const universe = await loadUniverse()
  summary.productsTotal = universe.length

  const productsWithAsin = universe.filter((p) => p.amazonAsin)
  console.log(`Loaded ${universe.length} products, ${productsWithAsin.length} have ASINs`)

  // 2. Batch and refresh
  const batches: UniverseProduct[][] = []
  for (let i = 0; i < productsWithAsin.length; i += BATCH_SIZE) {
    batches.push(productsWithAsin.slice(i, i + BATCH_SIZE))
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`Batch ${i + 1}/${batches.length} (${batch.length} ASINs)`)

    let results: PaapiResult[]
    try {
      results = await fetchBatchWithRetry(batch.map((p) => p.amazonAsin!))
    } catch (e) {
      console.error(`Batch ${i + 1} failed after retries:`, e)
      summary.productsFailed += batch.length
      continue
    }

    // 3. Compare against prior state and detect drift
    for (const result of results) {
      const product = batch.find((p) => p.amazonAsin === result.asin)
      if (!product) continue

      summary.productsRefreshed++

      // ASIN not found
      if (result.errors.includes('ItemNotAccessible') || result.errors.includes('InvalidParameterValue')) {
        summary.driftEvents.push({
          asin: result.asin,
          productName: product.productName,
          kind: 'asin_not_found',
          oldValue: 'valid',
          newValue: 'not_found',
        })
        if (opts.write && !opts.dryRun && !OBSERVE_ONLY) {
          await markProductUnavailable(product.universeId, 'asin_not_found')
        }
        continue
      }

      // Availability change
      if (result.availability === 'out_of_stock') {
        summary.driftEvents.push({
          asin: result.asin,
          productName: product.productName,
          kind: 'unavailable',
          oldValue: 'in_stock',
          newValue: 'out_of_stock',
        })
        if (opts.write && !opts.dryRun && !OBSERVE_ONLY) {
          await markProductUnavailable(product.universeId, 'out_of_stock')
        }
      }

      // Price drift
      if (result.priceLow !== null && result.priceHigh !== null) {
        const oldMid = (product.priceLow + product.priceHigh) / 2
        const newMid = (result.priceLow + result.priceHigh) / 2
        const pctChange = oldMid === 0 ? 0 : ((newMid - oldMid) / oldMid) * 100

        if (Math.abs(pctChange) >= PRICE_DRIFT_ALERT_PCT) {
          summary.driftEvents.push({
            asin: result.asin,
            productName: product.productName,
            kind: pctChange > 0 ? 'price_jump' : 'price_drop',
            oldValue: `$${product.priceLow.toFixed(2)}-$${product.priceHigh.toFixed(2)}`,
            newValue: `$${result.priceLow.toFixed(2)}-$${result.priceHigh.toFixed(2)}`,
            pctChange,
          })
        }

        // Persist if move > threshold. In OBSERVE_ONLY mode (weeks 1-2)
        // we count it for the summary but don't actually update the
        // universe — drift patterns get observed without changing prices.
        if (Math.abs(pctChange) >= PRICE_UPDATE_THRESHOLD_PCT) {
          if (opts.write && !opts.dryRun && !OBSERVE_ONLY) {
            await updateProductPrice(product.universeId, result.priceLow, result.priceHigh)
            summary.pricesUpdated++
          }
        }

        // Always write a snapshot row for history — even in observe-only
        // mode. Snapshots are how we evaluate the storage decision at the
        // end of week 2.
        if (!opts.dryRun) {
          await writePriceSnapshot({
            universeId: product.universeId,
            asin: result.asin,
            priceLow: result.priceLow,
            priceHigh: result.priceHigh,
            availability: result.availability,
            capturedAt: new Date(),
          })
        }
      }
    }

    // Rate limit
    if (i < batches.length - 1) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  // 4. Bulk drift detection — if too many products drifted at once, escalate
  const bulkDriftCount = summary.driftEvents.filter(
    (e) => (e.kind === 'price_jump' || e.kind === 'price_drop') && Math.abs(e.pctChange || 0) >= PRICE_DRIFT_BULK_PCT
  ).length
  if (bulkDriftCount / summary.productsRefreshed >= PRICE_DRIFT_BULK_FRACTION) {
    summary.bulkDriftDetected = true
  }

  // 5. API cost estimate — PA-API is free for associates in good standing
  // but rate-limited. Cost tracking is for accounting; actual marginal $
  // is effectively zero unless we exceed quota.
  summary.apiCostEstimateCents = 0
  summary.finishedAt = new Date()

  // 6. Alert
  if (summary.driftEvents.length > 0 || summary.bulkDriftDetected) {
    await emitAlert(summary)
  }

  // 7. Write summary to event log
  if (!opts.dryRun) {
    await writeRunSummary(summary)
  }

  return summary
}

// =============================================================================
// PA-API CLIENT
// =============================================================================

async function fetchBatchWithRetry(asins: string[]): Promise<PaapiResult[]> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchBatch(asins)
    } catch (e) {
      lastError = e as Error
      const isRateLimit = lastError.message.includes('429') || lastError.message.includes('TooManyRequests')
      const backoff = isRateLimit ? 5000 * attempt : 1000 * attempt
      console.warn(`Attempt ${attempt} failed: ${lastError.message}. Retrying in ${backoff}ms.`)
      await sleep(backoff)
    }
  }
  throw lastError || new Error('Unknown PA-API failure')
}

async function fetchBatch(asins: string[]): Promise<PaapiResult[]> {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY
  const partnerTag = process.env.AMAZON_PAAPI_ASSOCIATE_TAG
  if (!accessKey || !secretKey || !partnerTag) {
    throw new Error('AMAZON_PAAPI credentials not configured')
  }

  const payload = {
    ItemIds: asins,
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Resources: [
      'ItemInfo.Title',
      'Offers.Listings.Availability.Type',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Summaries.HighestPrice',
      'Offers.Summaries.LowestPrice',
    ],
  }

  const body = JSON.stringify(payload)
  const headers = signPaapiRequest({
    accessKey,
    secretKey,
    region: PAAPI_REGION,
    host: PAAPI_HOST,
    uri: PAAPI_URI,
    target: PAAPI_TARGET,
    body,
  })

  const response = await fetch(`https://${PAAPI_HOST}${PAAPI_URI}`, {
    method: 'POST',
    headers,
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`PA-API ${response.status}: ${text.substring(0, 200)}`)
  }

  const data = (await response.json()) as PaapiResponseShape
  return parsePaapiResponse(data, asins)
}

// Minimal PA-API response shape — only the fields we read
interface PaapiResponseShape {
  ItemsResult?: {
    Items?: Array<{
      ASIN: string
      DetailPageURL?: string
      ItemInfo?: { Title?: { DisplayValue?: string } }
      Offers?: {
        Listings?: Array<{
          Availability?: { Type?: string }
          Price?: { Amount?: number; Currency?: string }
        }>
        Summaries?: Array<{
          HighestPrice?: { Amount?: number }
          LowestPrice?: { Amount?: number }
        }>
      }
    }>
  }
  Errors?: Array<{ Code: string; Message: string }>
}

function parsePaapiResponse(data: PaapiResponseShape, requestedAsins: string[]): PaapiResult[] {
  const results: PaapiResult[] = []
  const seenAsins = new Set<string>()

  for (const item of data.ItemsResult?.Items || []) {
    seenAsins.add(item.ASIN)
    const listing = item.Offers?.Listings?.[0]
    const summary = item.Offers?.Summaries?.[0]
    const priceLow = summary?.LowestPrice?.Amount ?? listing?.Price?.Amount ?? null
    const priceHigh = summary?.HighestPrice?.Amount ?? listing?.Price?.Amount ?? null
    const availabilityType = listing?.Availability?.Type
    const availability: PaapiResult['availability'] = availabilityType === 'Now'
      ? 'in_stock'
      : availabilityType === 'Limited'
        ? 'limited'
        : availabilityType
          ? 'out_of_stock'
          : 'unknown'

    results.push({
      asin: item.ASIN,
      priceLow,
      priceHigh,
      availability,
      title: item.ItemInfo?.Title?.DisplayValue ?? null,
      detailPageUrl: item.DetailPageURL ?? null,
      errors: [],
    })
  }

  // Surface errors for ASINs that didn't come back
  for (const asin of requestedAsins) {
    if (!seenAsins.has(asin)) {
      const err = data.Errors?.find((e) => e.Message.includes(asin))
      results.push({
        asin,
        priceLow: null,
        priceHigh: null,
        availability: 'unknown',
        title: null,
        detailPageUrl: null,
        errors: [err?.Code || 'ItemNotAccessible'],
      })
    }
  }

  return results
}

// =============================================================================
// AWS V4 SIGNING — PA-API requires SigV4
// =============================================================================

interface SignRequestParams {
  accessKey: string
  secretKey: string
  region: string
  host: string
  uri: string
  target: string
  body: string
}

function signPaapiRequest(p: SignRequestParams): Record<string, string> {
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.substring(0, 8)

  const payloadHash = crypto.createHash('sha256').update(p.body).digest('hex')

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${p.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${p.target}\n`
  const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target'

  const canonicalRequest = [
    'POST',
    p.uri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${p.region}/${PAAPI_SERVICE}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n')

  const kDate = crypto.createHmac('sha256', `AWS4${p.secretKey}`).update(dateStamp).digest()
  const kRegion = crypto.createHmac('sha256', kDate).update(p.region).digest()
  const kService = crypto.createHmac('sha256', kRegion).update(PAAPI_SERVICE).digest()
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${p.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Encoding': 'amz-1.0',
    Host: p.host,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': p.target,
    Authorization: authorization,
  }
}

// =============================================================================
// PERSISTENCE — these are placeholders; wire to Prisma when the schema is up
// =============================================================================

async function loadUniverse(): Promise<UniverseProduct[]> {
  // In production: read from src/content/smart-cart/universe.ts. For now,
  // a stub that returns an empty array — wire to the actual universe import
  // in the codebase.
  //
  // Implementation note: if the universe stays as a TS source file rather
  // than a DB table, this function imports it directly. If it migrates to
  // a CatalogProduct table, this function queries that table.
  return []
}

async function updateProductPrice(universeId: string, priceLow: number, priceHigh: number): Promise<void> {
  // Two paths:
  //   1. Universe in source file: rewrite the file via codegen, open a PR.
  //      Safer because price changes are reviewed and the universe stays
  //      in version control.
  //   2. Universe in DB: direct update on CatalogProduct table.
  //      Faster but harder to audit.
  //
  // Recommendation: path 1 for week 1-12. Migrate to path 2 only when the
  // universe is too large to manage in source (> 1,000 SKUs).
  console.log(`[update] ${universeId}: $${priceLow}-$${priceHigh}`)
}

async function markProductUnavailable(universeId: string, reason: string): Promise<void> {
  console.log(`[unavailable] ${universeId}: ${reason}`)
}

async function writePriceSnapshot(snap: {
  universeId: string
  asin: string
  priceLow: number
  priceHigh: number
  availability: string
  capturedAt: Date
}): Promise<void> {
  // Writes to CatalogPriceSnapshot table — see schema addition below
  await prisma.$executeRaw`
    INSERT INTO "CatalogPriceSnapshot" (id, "universeId", asin, "priceLow", "priceHigh", availability, "capturedAt")
    VALUES (${crypto.randomUUID()}, ${snap.universeId}, ${snap.asin}, ${snap.priceLow}, ${snap.priceHigh}, ${snap.availability}, ${snap.capturedAt})
  `
}

async function writeRunSummary(summary: RunSummary): Promise<void> {
  await prisma.eventLog.create({
    data: {
      eventType: 'CATALOG_REFRESH_COMPLETED',
      payloadJson: summary as any,
      source: 'cron',
    },
  })
}

// =============================================================================
// ALERTS — email digest via Resend
// =============================================================================
//
// One email per refresh run that has at least one drift event. Below
// threshold = no email at all. The principle: silence is success. You
// only hear from the cron when something needs attention.
//
// In OBSERVE_ONLY mode the subject line prefixes [OBSERVE] so it's
// obvious nothing was written — useful during weeks 1-2 of the build.

async function emitAlert(summary: RunSummary): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const alertEmail = process.env.ALERT_EMAIL
  const fromAddress = process.env.ALERT_FROM_EMAIL || 'alerts@alderprojects.com'

  if (!apiKey || !alertEmail) {
    console.log('RESEND_API_KEY or ALERT_EMAIL not configured, skipping email digest')
    return
  }

  // Silence is success — no email if no drift
  if (summary.driftEvents.length === 0 && !summary.bulkDriftDetected) {
    return
  }

  const prefix = OBSERVE_ONLY ? '[OBSERVE] ' : ''
  const env = process.env.VERCEL_ENV === 'production' ? 'PROD' : 'STAGING'
  const subject = summary.bulkDriftDetected
    ? `${prefix}[${env}] Bulk catalog drift detected — ${summary.driftEvents.length} events`
    : `${prefix}[${env}] Catalog refresh: ${summary.driftEvents.length} drift event(s)`

  const html = buildEmailDigest(summary)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Alder Catalog Watchdog <${fromAddress}>`,
      to: [alertEmail],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`Resend email failed: ${response.status} ${text.substring(0, 200)}`)
  }
}

function buildEmailDigest(summary: RunSummary): string {
  const durationSec = Math.round((summary.finishedAt.getTime() - summary.startedAt.getTime()) / 1000)

  // Group drift events by kind for digestibility
  const byKind: Record<string, DriftEvent[]> = {}
  for (const e of summary.driftEvents) {
    if (!byKind[e.kind]) byKind[e.kind] = []
    byKind[e.kind].push(e)
  }

  const kindOrder: DriftEvent['kind'][] = ['asin_not_found', 'unavailable', 'url_redirect', 'price_jump', 'price_drop']
  const kindLabels: Record<DriftEvent['kind'], string> = {
    asin_not_found: 'ASINs not found',
    unavailable: 'Newly unavailable',
    url_redirect: 'Affiliate URL redirects',
    price_jump: 'Price jumps (>15%)',
    price_drop: 'Price drops (>15%)',
  }

  const sections: string[] = []
  for (const kind of kindOrder) {
    const events = byKind[kind]
    if (!events || events.length === 0) continue
    const rows = events
      .map((e) => {
        const pct = e.pctChange ? ` <span style="color: ${e.pctChange > 0 ? '#a32d2d' : '#0f6e56'}">(${e.pctChange > 0 ? '+' : ''}${e.pctChange.toFixed(1)}%)</span>` : ''
        return `<tr>
          <td style="padding: 6px 12px; font-family: ui-monospace, monospace; font-size: 12px; color: #666;">${e.asin}</td>
          <td style="padding: 6px 12px; font-size: 13px;">${escapeHtml(e.productName)}</td>
          <td style="padding: 6px 12px; font-size: 13px; color: #444;">${escapeHtml(e.oldValue)} → ${escapeHtml(e.newValue)}${pct}</td>
        </tr>`
      })
      .join('')
    sections.push(`
      <h3 style="margin: 24px 0 8px; font-size: 14px; font-weight: 500;">${kindLabels[kind]} (${events.length})</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
        <thead style="background: #f5f5f5;">
          <tr>
            <th style="padding: 8px 12px; font-size: 11px; font-weight: 500; text-align: left; color: #666;">ASIN</th>
            <th style="padding: 8px 12px; font-size: 11px; font-weight: 500; text-align: left; color: #666;">Product</th>
            <th style="padding: 8px 12px; font-size: 11px; font-weight: 500; text-align: left; color: #666;">Change</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `)
  }

  const observeBanner = OBSERVE_ONLY
    ? `<div style="background: #fff3cd; border: 1px solid #ffe69c; padding: 10px 14px; border-radius: 6px; margin-bottom: 20px; font-size: 13px;">
        <strong>Observe-only mode.</strong> No catalog updates were applied. Snapshots written to the database for later analysis.
      </div>`
    : ''

  const bulkBanner = summary.bulkDriftDetected
    ? `<div style="background: #fde8e8; border: 1px solid #f7c1c1; padding: 10px 14px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #a32d2d;">
        <strong>Bulk drift detected.</strong> ${(summary.driftEvents.filter((e) => e.kind === 'price_jump' || e.kind === 'price_drop').length / summary.productsRefreshed * 100).toFixed(1)}% of refreshed products moved &ge;10%. Investigate before next refresh.
      </div>`
    : ''

  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #222;">
  <h1 style="font-size: 18px; font-weight: 500; margin: 0 0 4px;">Catalog refresh digest</h1>
  <p style="font-size: 13px; color: #666; margin: 0 0 20px;">
    ${summary.startedAt.toUTCString()} · ${durationSec}s · ${summary.productsRefreshed}/${summary.productsTotal} products refreshed
    ${summary.productsFailed > 0 ? ` · <strong style="color: #a32d2d;">${summary.productsFailed} failed</strong>` : ''}
  </p>
  ${observeBanner}
  ${bulkBanner}
  <div style="background: #f9f9f9; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px;">
    <strong>Summary:</strong>
    ${summary.driftEvents.length} drift event(s) ·
    ${summary.pricesUpdated} price update(s) ${OBSERVE_ONLY ? '(would-be)' : 'applied'} ·
    ${summary.productsFailed} failure(s)
  </div>
  ${sections.join('\n')}
  <p style="margin-top: 32px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px;">
    Catalog refresh worker · ${process.env.VERCEL_URL || 'local'} · Sent because at least one drift event occurred. Silent runs mean no email.
  </p>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

if (require.main === module) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const write = args.includes('--write')
  if (!dryRun && !write) {
    console.error('Specify --dry-run or --write')
    process.exit(1)
  }
  runCatalogRefresh({ dryRun, write })
    .then((summary) => {
      console.log('\n=== SUMMARY ===')
      console.log(JSON.stringify(summary, null, 2))
      process.exit(0)
    })
    .catch((e) => {
      console.error('Catalog refresh failed:', e)
      process.exit(1)
    })
}

// =============================================================================
// SCHEMA ADDITION REQUIRED IN prisma/schema.prisma
// =============================================================================
//
// model CatalogPriceSnapshot {
//   id           String   @id @default(cuid())
//   universeId   String
//   asin         String
//   priceLow     Float
//   priceHigh    Float
//   availability String   // "in_stock" | "limited" | "out_of_stock" | "unknown"
//   capturedAt   DateTime @default(now())
//
//   @@index([universeId, capturedAt])
//   @@index([asin, capturedAt])
// }
//
// model CatalogProduct {
//   // Optional: only if migrating universe from source file to DB
//   // (recommended at >1,000 SKUs, not before)
//   universeId       String   @id
//   productName      String
//   amazonAsin       String?  @unique
//   affiliateUrl     String
//   priceLow         Float
//   priceHigh        Float
//   tier             String   // "budget" | "sweet_spot" | "premium"
//   availability     String   @default("in_stock")
//   unavailableReason String?
//   tags             Json
//   lastRefreshedAt  DateTime?
//   updatedAt        DateTime @updatedAt
//
//   @@index([availability])
// }
//
// =============================================================================
