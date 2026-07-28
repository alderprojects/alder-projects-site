/**
 * v7.4.0 — PA-API SearchItems client for cart-candidate lookup.
 *
 * The catalog refresh cron (src/lib/catalog/refresh.ts) already implements
 * GetItems with SigV4; this module implements SearchItems with the same
 * signing scheme. Kept separate because refresh.ts keeps its signer private
 * and its request shape is ASIN-batch specific.
 *
 * Degrades gracefully: if PA-API credentials are missing or the call fails,
 * returns [] — the pipeline persists cart candidates with searchQuery only
 * and pricing happens later at cart-open (staleness re-fetch is the norm
 * anyway; re-pricing never changes a verdict).
 */

import crypto from 'crypto'

const PAAPI_HOST = 'webservices.amazon.com'
const PAAPI_URI = '/paapi5/searchitems'
const PAAPI_REGION = process.env.AMAZON_PAAPI_REGION || 'us-east-1'
const PAAPI_SERVICE = 'ProductAdvertisingAPI'
const PAAPI_TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'

export interface SearchResult {
  asin: string
  title: string | null
  priceLow: number | null
  priceHigh: number | null
  availability: string
  /** v7.4.10 CR5 — PA-API primary image, used UNMODIFIED or not at all. */
  imageUrl: string | null
}

export async function searchItems(query: string, maxResults = 6): Promise<SearchResult[]> {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY
  const partnerTag = process.env.AMAZON_PAAPI_ASSOCIATE_TAG
  if (!accessKey || !secretKey || !partnerTag) return []

  const payload = {
    Keywords: query,
    ItemCount: Math.min(maxResults, 10),
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Resources: [
      'ItemInfo.Title',
      // v7.4.10 — official product imagery for ASIN-resolved cards (CR5)
      'Images.Primary.Large',
      'Offers.Listings.Availability.Type',
      'Offers.Listings.Price',
      'Offers.Summaries.HighestPrice',
      'Offers.Summaries.LowestPrice',
    ],
  }

  const body = JSON.stringify(payload)
  const headers = signRequest({ accessKey, secretKey, body })

  try {
    const response = await fetch(`https://${PAAPI_HOST}${PAAPI_URI}`, {
      method: 'POST',
      headers,
      body,
    })
    if (!response.ok) {
      console.warn(`[recommend/paapi] SearchItems ${response.status}: ${(await response.text()).slice(0, 200)}`)
      return []
    }
    const data = (await response.json()) as SearchResponseShape
    return parseResponse(data)
  } catch (e) {
    console.warn(`[recommend/paapi] SearchItems failed: ${(e as Error).message.slice(0, 200)}`)
    return []
  }
}

interface SearchResponseShape {
  SearchResult?: {
    Items?: Array<{
      ASIN: string
      ItemInfo?: { Title?: { DisplayValue?: string } }
      Images?: { Primary?: { Large?: { URL?: string } } }
      Offers?: {
        Listings?: Array<{ Availability?: { Type?: string }; Price?: { Amount?: number } }>
        Summaries?: Array<{ HighestPrice?: { Amount?: number }; LowestPrice?: { Amount?: number } }>
      }
    }>
  }
}

function parseResponse(data: SearchResponseShape): SearchResult[] {
  return (data.SearchResult?.Items ?? []).map((item) => {
    const listing = item.Offers?.Listings?.[0]
    const summary = item.Offers?.Summaries?.[0]
    const availabilityType = listing?.Availability?.Type
    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue ?? null,
      imageUrl: item.Images?.Primary?.Large?.URL ?? null,
      priceLow: summary?.LowestPrice?.Amount ?? listing?.Price?.Amount ?? null,
      priceHigh: summary?.HighestPrice?.Amount ?? listing?.Price?.Amount ?? null,
      availability:
        availabilityType === 'Now'
          ? 'in_stock'
          : availabilityType === 'Limited'
            ? 'limited'
            : availabilityType
              ? 'out_of_stock'
              : 'unknown',
    }
  })
}

// AWS SigV4 — same scheme as catalog/refresh.ts, scoped to SearchItems.
function signRequest(p: { accessKey: string; secretKey: string; body: string }): Record<string, string> {
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.substring(0, 8)

  const payloadHash = crypto.createHash('sha256').update(p.body).digest('hex')
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` + `host:${PAAPI_HOST}\n` + `x-amz-date:${amzDate}\n` + `x-amz-target:${PAAPI_TARGET}\n`
  const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target'
  const canonicalRequest = ['POST', PAAPI_URI, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')
  const credentialScope = `${dateStamp}/${PAAPI_REGION}/${PAAPI_SERVICE}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n')

  const kDate = crypto.createHmac('sha256', `AWS4${p.secretKey}`).update(dateStamp).digest()
  const kRegion = crypto.createHmac('sha256', kDate).update(PAAPI_REGION).digest()
  const kService = crypto.createHmac('sha256', kRegion).update(PAAPI_SERVICE).digest()
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Encoding': 'amz-1.0',
    Host: PAAPI_HOST,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': PAAPI_TARGET,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${p.accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  }
}
