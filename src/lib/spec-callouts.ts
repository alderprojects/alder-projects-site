// v7.2.7 — extract short spec callouts from a productSpec string.
// v7.2.8 — strict review/rating phrase filter (compliance gate).
//
// productSpec is 1-2 sentences of technical spec authored by the
// catalog. We render it as italic copy + 2-3 chip callouts. Catalog
// authors sometimes include "4.7 stars over 42,000+ reviews" style
// claims; the result-page compliance gate forbids surfacing those
// (no review-count data we own). Both `sanitizeProductSpec` and
// `extractSpecCallouts` strip review/rating language at render time
// regardless of what's in the underlying data.

const MAX_CALLOUT_LEN = 50
const MAX_CALLOUTS = 3

// Phrase-level patterns that indicate review/rating content. Any
// sentence containing one of these is dropped wholesale.
const REVIEW_PHRASE_RE =
  /\b(\d+\.?\d*\s*stars?|\d[\d,]*\s*\+?\s*reviews?|reviewer\s+(favorite|favourite|pick)|top[\s-]?rated|best[\s-]?seller|[#1]+[\s-]?best)/i

function isReviewSentence(s: string): boolean {
  return REVIEW_PHRASE_RE.test(s)
}

/**
 * Strip review/rating sentences from productSpec. Used for the italic
 * spec line on RecommendedPickCard. Returns the joined remainder.
 */
export function sanitizeProductSpec(productSpec: string): string {
  if (!productSpec) return ''
  const sentences = productSpec
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
  return sentences.filter(s => !isReviewSentence(s)).join(' ')
}

export function extractSpecCallouts(productSpec: string): string[] {
  if (!productSpec) return []
  const sentences = productSpec
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s && !isReviewSentence(s))

  const fragments: string[] = []
  for (const s of sentences) {
    for (const part of s.split(/,\s*/)) {
      const cleaned = part
        .replace(/[.!?]+$/, '')
        .replace(/^\(|\)$/g, '')
        .trim()
      if (
        cleaned.length === 0 ||
        cleaned.length > MAX_CALLOUT_LEN ||
        // Phrase-level filter: catches "4.7 stars over 42" fragments
        // even when they survive sentence-splitting.
        REVIEW_PHRASE_RE.test(cleaned) ||
        /^(reviewer|review|warranty|guaranteed|covers?\s+\d)/i.test(cleaned)
      ) {
        continue
      }
      fragments.push(cleaned)
      if (fragments.length >= MAX_CALLOUTS) return fragments
    }
  }
  return fragments
}
