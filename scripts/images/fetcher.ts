// v7.2.7 — shared HTTP utility for the image-sourcing pipeline.
//
// - Identifying User-Agent (no stealth)
// - Per-domain rate limiting (one request per 2 seconds)
// - robots.txt cache + respect (skip + log if disallowed)
// - og:image / schema.org Product image extraction

import { load } from 'cheerio'

export const USER_AGENT =
  'AlderProjects-ImageAudit/1.0 (+hello@alderprojects.com; one-business-day removal on request)'

const PER_DOMAIN_DELAY_MS = 2_000

const lastFetchByDomain = new Map<string, number>()
const robotsCache = new Map<string, string | null>()

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

async function delayForDomain(domain: string) {
  const last = lastFetchByDomain.get(domain) ?? 0
  const now = Date.now()
  const wait = PER_DOMAIN_DELAY_MS - (now - last)
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  lastFetchByDomain.set(domain, Date.now())
}

async function loadRobots(domain: string): Promise<string | null> {
  if (robotsCache.has(domain)) return robotsCache.get(domain) ?? null
  try {
    const resp = await fetch(`https://${domain}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8_000),
    })
    if (!resp.ok) {
      robotsCache.set(domain, null)
      return null
    }
    const text = await resp.text()
    robotsCache.set(domain, text)
    return text
  } catch {
    robotsCache.set(domain, null)
    return null
  }
}

// Minimal robots.txt parser: returns true if our UA (or *) is
// disallowed from the path. Conservative — any matching Disallow wins.
function isDisallowed(robotsTxt: string, path: string): boolean {
  const lines = robotsTxt.split(/\r?\n/)
  let inGlobal = false
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    if (key === 'user-agent') {
      inGlobal = value === '*' || value.toLowerCase().includes('alderprojects')
      continue
    }
    if (inGlobal && key === 'disallow' && value && path.startsWith(value)) {
      return true
    }
  }
  return false
}

export async function checkRobots(url: string): Promise<{ allowed: boolean; reason?: string }> {
  const domain = getDomain(url)
  if (!domain) return { allowed: false, reason: 'invalid url' }
  const robots = await loadRobots(domain)
  if (!robots) return { allowed: true }
  const path = new URL(url).pathname
  if (isDisallowed(robots, path)) return { allowed: false, reason: 'robots.txt Disallow' }
  return { allowed: true }
}

export interface FetchResult {
  ok: boolean
  status?: number
  body?: string
  bytes?: ArrayBuffer
  contentType?: string
  reason?: string
}

export async function fetchHtml(url: string): Promise<FetchResult> {
  const domain = getDomain(url)
  if (!domain) return { ok: false, reason: 'invalid url' }

  const robots = await checkRobots(url)
  if (!robots.allowed) return { ok: false, reason: robots.reason }

  await delayForDomain(domain)
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(15_000),
      redirect: 'follow',
    })
    if (!resp.ok) return { ok: false, status: resp.status, reason: `http ${resp.status}` }
    const body = await resp.text()
    return { ok: true, status: resp.status, body, contentType: resp.headers.get('content-type') ?? undefined }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

export async function fetchBinary(url: string): Promise<FetchResult> {
  const domain = getDomain(url)
  if (!domain) return { ok: false, reason: 'invalid url' }

  await delayForDomain(domain)
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(20_000),
      redirect: 'follow',
    })
    if (!resp.ok) return { ok: false, status: resp.status, reason: `http ${resp.status}` }
    const bytes = await resp.arrayBuffer()
    return { ok: true, status: resp.status, bytes, contentType: resp.headers.get('content-type') ?? undefined }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

// Extract a primary product image URL from HTML. Tries (in order):
// og:image, twitter:image, schema.org Product image, first <img> with
// product-ish attributes.
export function extractProductImage(html: string, baseUrl: string): string | null {
  const $ = load(html)

  const og = $('meta[property="og:image"]').attr('content')
  if (og) return resolveUrl(og, baseUrl)

  const tw = $('meta[name="twitter:image"]').attr('content')
  if (tw) return resolveUrl(tw, baseUrl)

  // schema.org Product
  const ldJson = $('script[type="application/ld+json"]')
  for (const el of ldJson.toArray()) {
    const txt = $(el).contents().text()
    try {
      const data = JSON.parse(txt)
      const found = findSchemaImage(data)
      if (found) return resolveUrl(found, baseUrl)
    } catch {
      // skip malformed JSON-LD
    }
  }

  return null
}

function findSchemaImage(node: unknown): string | null {
  if (!node) return null
  if (Array.isArray(node)) {
    for (const item of node) {
      const r = findSchemaImage(item)
      if (r) return r
    }
    return null
  }
  if (typeof node !== 'object') return null
  const obj = node as Record<string, unknown>
  const type = obj['@type']
  if (
    (typeof type === 'string' && type.toLowerCase().includes('product')) ||
    (Array.isArray(type) && type.some(t => typeof t === 'string' && t.toLowerCase().includes('product')))
  ) {
    const img = obj.image
    if (typeof img === 'string') return img
    if (Array.isArray(img) && typeof img[0] === 'string') return img[0]
    if (img && typeof img === 'object') {
      const imgObj = img as Record<string, unknown>
      if (typeof imgObj.url === 'string') return imgObj.url
    }
  }
  // recurse
  for (const k of Object.keys(obj)) {
    const r = findSchemaImage(obj[k])
    if (r) return r
  }
  return null
}

function resolveUrl(maybeRelative: string, base: string): string {
  try {
    return new URL(maybeRelative, base).href
  } catch {
    return maybeRelative
  }
}

export function extFromContentType(ct: string | undefined): string {
  if (!ct) return 'jpg'
  if (ct.includes('webp')) return 'webp'
  if (ct.includes('png')) return 'png'
  if (ct.includes('svg')) return 'svg'
  if (ct.includes('gif')) return 'gif'
  return 'jpg'
}
