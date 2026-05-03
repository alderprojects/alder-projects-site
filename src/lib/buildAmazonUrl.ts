// Centralized Amazon affiliate URL builder.
//
// Pre-V7 the codebase had inline `az()` and AMZ() helpers in
// individual files. V7 introduces buildAmazonUrl as the single
// import path so future work has one place to update the tag,
// add UTM tracking, or swap the search interface.
//
// All V7 Smart Cart and Worth-It Plan affiliate links route
// through this helper.

const ALDER_AMAZON_TAG = 'alderprojects-20'

export function buildAmazonUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${ALDER_AMAZON_TAG}`
}

// Build a direct ASIN URL (used when we have a specific product ASIN
// from a tier definition rather than a search query).
export function buildAmazonAsinUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${ALDER_AMAZON_TAG}`
}

// Used by the affiliate-link audit: returns true if the URL is an
// Amazon search/product URL carrying the alderprojects-20 tag.
export function isTaggedAmazonUrl(url: string): boolean {
  return /amazon\.com\//.test(url) && url.includes(`tag=${ALDER_AMAZON_TAG}`)
}

export const AMAZON_TAG = ALDER_AMAZON_TAG
