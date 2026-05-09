// v7.2.9 — DALL-E / OpenAI prompt builder.
//
// Construct a prompt that produces a consistent, recognizable
// illustration of the product. Brand prefixes are stripped from the
// productName so the model doesn't try to spell or render brand names
// as text in the image (which it does poorly and creates trademark
// muddle).

const BRAND_STARTERS_TO_STRIP = new Set([
  'pipishell',
  'ryqtop',
  'diolove',
  'spaceaid',
  'holdn',           // catches HOLDN'STORAGE
  'holdnstorage',
  'everie',
  'utoplike',
  'kraftmaid',
  'simple',          // Simple Houseware
  'mdesign',
  'mhomelabs',
  'homelabs',
  'polywood',
  'amerock',
  'kreg',
  'cabot',
  'weber',
  'govee',
  'yolink',
  'frost',           // Frost King
  'first',           // First Alert
  'weathertech',
  'pentek',
  'rev',             // Rev-A-Shelf
  'liberty',
  'top',             // Top Knobs
  'container',       // Container Store
  'pottery',         // Pottery Barn
  'thermacell',
  'sterilite',
  'honeywell',
  'milwaukee',
  'stanley',
  'suncast',
  'bosch',
  'behr',
  'blum',
  'wooster',
  'whizz',
  'dewalt',
  'sunbrella',
  'sun',             // Sun Joe
  'gorilla',
  'ikea',
  'tjusig',
  'waterhog',
])

// Multi-word brand keys (concatenated, lowercase, letters-only). Order
// matters for hyphenated brands: "Rev-A-Shelf" treated as one token.
const MULTIWORD_BRAND_KEYS = new Set([
  'revashelf',
  'containerstore',
  'potterybarn',
  'topknobs',
  'firstalert',
  'firstalertstore',
  'frostking',
  'weathertech',
  'pentairhome',
  'milwaukeetool',
  'sunjoe',
  'kraftmaid',
  'simplehouseware',
  'mdesignhomedecor',
  'mdesignhome',
  'gorillagrip',
  'pottery',
  'goalzero',
])

/**
 * Strip brand prefix from productName. Returns the descriptive remainder
 * suitable for an illustration prompt.
 *
 * Strategy: try multi-word brand match first (1-3 leading words
 * concatenated, letters-only), fall back to single-word strip via
 * BRAND_STARTERS_TO_STRIP, then peel all-caps and model-number tokens.
 */
export function stripBrandPrefix(productName: string): string {
  // Remove parenthetical model numbers and aside notes
  const withoutParens = productName.replace(/\([^)]*\)/g, '').trim()
  let words = withoutParens.split(/\s+/)

  // Multi-word match: try 3, then 2 leading words.
  for (const span of [3, 2]) {
    if (words.length > span) {
      const candidate = words
        .slice(0, span)
        .join('')
        .toLowerCase()
        .replace(/[^a-z]/g, '')
      if (MULTIWORD_BRAND_KEYS.has(candidate)) {
        words = words.slice(span)
        break
      }
    }
  }

  // Single-word peel loop
  while (words.length > 1) {
    const raw = words[0]
    const normalized = raw.toLowerCase().replace(/[^a-z]/g, '')
    if (!normalized) {
      words.shift()
      continue
    }
    if (
      BRAND_STARTERS_TO_STRIP.has(normalized) ||
      MULTIWORD_BRAND_KEYS.has(normalized)
    ) {
      words.shift()
      continue
    }
    // All-caps single token (e.g. "DEWALT") → drop
    if (/^[A-Z]+$/.test(raw) && raw.length > 1) {
      words.shift()
      continue
    }
    // Hyphenated brand-like token (e.g. "Rev-A-Shelf") that wasn't
    // caught by the multi-word match because it has no spaces.
    if (raw.includes('-') && /^[A-Z]/.test(raw) && MULTIWORD_BRAND_KEYS.has(normalized)) {
      words.shift()
      continue
    }
    // Looks like a model number ("DWA1184", "M18", "PRO5") → drop
    if (/^[A-Z]+\d+/.test(raw) || /^\d+[A-Z]+$/.test(raw)) {
      words.shift()
      continue
    }
    // Hyphenated model SKU ("5WB2-2122CR-1", "T9-PRO5") → drop
    if (/^[A-Z0-9]+(-[A-Z0-9]+)+$/.test(raw)) {
      words.shift()
      continue
    }
    break
  }

  return (
    words
      .join(' ')
      // Strip trailing model fragments and noise
      .replace(/[,;]\s*\d+[\s-]?[A-Za-z]+\b/g, '')
      .replace(/\s+/g, ' ')
      .trim() || productName
  )
}

const STYLE_BASE =
  'Clean minimalist product illustration. Single product centered on a soft cream-colored background (#f5efe2). Flat-shaded illustration style with subtle dimensional shading and soft shadows. No text, no labels, no brand logos, no human figures, no environmental scenes, no decorative elements. The product fills approximately 70% of the frame. Square composition. Clearly identifiable at thumbnail size.'

/**
 * Build the OpenAI image prompt for a universe entry.
 */
export function buildPrompt(
  productName: string,
  productSpec: string,
  topics: string[],
  functions: string[] = [],
): string {
  let subject = stripBrandPrefix(productName)
  // If brand-strip leaves a very thin subject (e.g., "Two-Tier"), use
  // the function tag as the primary subject and append the stripped
  // name as a modifier.
  const wordCount = subject.trim().split(/\s+/).length
  if (subject.length < 20 || wordCount < 3) {
    const fnSubject = functions[0]
      ? functions[0].replace(/_/g, ' ')
      : ''
    if (fnSubject) {
      subject = subject ? `${fnSubject} (${subject})` : fnSubject
    }
  }
  // Pull the first sentence of productSpec for additional descriptive
  // detail (material, size class). Strip review language defensively.
  const firstSentence = productSpec
    .split(/(?<=[.!?])\s+/)[0]
    ?.replace(
      /\b\d+\.?\d*\s*stars?|\d[\d,]*\+?\s*reviews?|reviewer favorite|top[\s-]?rated/gi,
      '',
    )
    .trim()
  const detail = firstSentence && firstSentence.length < 150 ? ` ${firstSentence}` : ''
  const context = topics.includes('outdoor')
    ? ' Outdoor / lakeside / patio context.'
    : topics.includes('kitchen')
      ? ' Kitchen / cabinet / drawer context.'
      : topics.includes('mudroom')
        ? ' Entry / mudroom context.'
        : ''
  return `${STYLE_BASE} Subject: ${subject}.${detail}${context}`
}
