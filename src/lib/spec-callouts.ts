// v7.2.7 — extract short spec callouts from a productSpec string.
//
// productSpec is 1-2 sentences of technical spec authored by the
// catalog. The result page shows it as a single italic line today;
// for the v7.2.7 refinement we additionally surface 2-3 short
// callouts as chips below the product image.
//
// Heuristic: split on sentence terminator and comma boundaries, take
// fragments shorter than 50 chars. Conservative — if no clean
// fragments exist, return an empty array and the chip strip just
// doesn't render.

const MAX_CALLOUT_LEN = 50
const MAX_CALLOUTS = 3

export function extractSpecCallouts(productSpec: string): string[] {
  if (!productSpec) return []
  // Split on sentence endings first.
  const sentences = productSpec
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  // Collect fragments: each sentence's comma-separated parts.
  const fragments: string[] = []
  for (const s of sentences) {
    for (const part of s.split(/,\s*/)) {
      const cleaned = part
        .replace(/[.!?]+$/, '')
        .replace(/^\(|\)$/g, '')
        .trim()
      if (
        cleaned.length > 0 &&
        cleaned.length <= MAX_CALLOUT_LEN &&
        // Skip fragments that are clearly meta ("Reviewer favorite", etc.)
        !/^(reviewer|review|warranty|guaranteed|covers? \d)/i.test(cleaned)
      ) {
        fragments.push(cleaned)
      }
      if (fragments.length >= MAX_CALLOUTS) return fragments
    }
  }
  return fragments
}
