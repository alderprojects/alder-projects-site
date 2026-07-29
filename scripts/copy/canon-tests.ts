/**
 * v7.4.14 §2 — the parts of the copy test plan that are mechanical.
 * (Prod screenshots + the ASSESSMENT_INTEREST EventLog check run at deploy.)
 */
import { execSync } from 'child_process'

/**
 * Single-quote for the shell. JSON.stringify emits DOUBLE quotes, inside
 * which the shell expands `$19` (positional parameter) to nothing — which
 * silently turned the "Why $19.99?" protected-copy assert into a search for
 * "Why .99?" and made it fail against a string that was present all along.
 */
function sh(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`
}
import {
  REFUND_POLICY,
  REFUND_WINDOW_DAYS,
  LANES,
  laneLabel,
  LANE_LIST_PHRASE,
  HERO_SUBHEAD,
  HERO_BADGES,
  betaBadge,
} from '@/lib/copy/canon'
import { REFUND_WINDOW_HOURS } from '@/lib/copy/canon'
import { CONFIG } from '@/lib/recommender-config'
import { isActive, seasonalLabel, inWindow } from '@/lib/copy/seasonal'
import { SMART_CART_CATEGORIES } from '@/lib/intent-config'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) }
  else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

/** grep -rn over `paths` (default: all of src), returning matching lines. */
function grep(pattern: string, paths = 'src'): string[] {
  try {
    const out = execSync(`grep -rniE ${sh(pattern)} --include=*.ts --include=*.tsx ${paths}`, {
      encoding: 'utf8',
    })
    return out.trim().split('\n').filter(Boolean)
  } catch {
    return [] // grep exits 1 on no match
  }
}

/** Fixed-string grep — for protected copy containing regex metacharacters. */
function grepFixed(needle: string, paths = 'src'): string[] {
  try {
    const out = execSync(`grep -rnF ${sh(needle)} --include=*.ts --include=*.tsx ${paths}`, {
      encoding: 'utf8',
    })
    return out.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

console.log('\n=== §2: refund single-source ===')
{
  check('canonical line is the spec string',
    REFUND_POLICY === '$19.99 · Full refund within 30 days, no questions asked.', REFUND_POLICY)
  check('window is 30 days', REFUND_WINDOW_DAYS === 30)

  // The contradiction class: a 24-hour claim anywhere near "refund".
  const refundLines = grep('refund')
  const twentyFour = refundLines.filter((l) => /24[ -]hours?/i.test(l))
  check('zero "24 hour" strings on any refund line', twentyFour.length === 0, twentyFour.join('\n'))

  // No surface may hardcode a competing window.
  const hardcoded = refundLines
    .filter((l) => /\b(7|14|24|48|60|90)[ -]day\b/i.test(l))
    .filter((l) => !/canon\.ts/.test(l))
  check('no competing hardcoded refund window', hardcoded.length === 0, hardcoded.join('\n'))
}

console.log('\n=== v7.4.16: the window is never a literal, anywhere ===')
{
  // v7.4.14 asserted this with a TEXT grep and passed while eight surfaces
  // rendered "24-hour refund window" from CONFIG at runtime. Assert the
  // derivation instead of the prose.
  check('REFUND_WINDOW_HOURS derives from the canonical days',
    REFUND_WINDOW_HOURS === REFUND_WINDOW_DAYS * 24, String(REFUND_WINDOW_HOURS))
  check('the Smart Cart config derives its window from the canon',
    CONFIG.products.smartCart.refundWindowHours === REFUND_WINDOW_HOURS,
    String(CONFIG.products.smartCart.refundWindowHours))

  // The enforced window must equal the promised one — a customer told
  // "30 days" must not get a 422 on day 5.
  check('enforced window == promised window',
    CONFIG.products.smartCart.refundWindowHours / 24 === REFUND_WINDOW_DAYS)

  // No component may compute its own window phrase from the hours value.
  const renders = grep('refundWindowHours', 'src/components src/lib/email.ts')
  check('no component renders a window from refundWindowHours', renders.length === 0, renders.join('\n'))
}

console.log('\n=== §2: lane canon ===')
{
  check('four lanes', LANES.length === 4)
  check('order is Buy / Skip / Wait / Monitor',
    LANE_LIST_PHRASE === 'Buy / Skip / Wait / Monitor', LANE_LIST_PHRASE)
  check('the engine enum is preserved (INVESTIGATE still the id)',
    LANES.some((l) => l.id === 'INVESTIGATE'))
  check('INVESTIGATE renders as Monitor', laneLabel('INVESTIGATE') === 'Monitor')
  check('MONITOR lane is blue', LANES.find((l) => l.id === 'INVESTIGATE')?.fg === '#3d4a7a')
  check('unknown verdict falls through unchanged', laneLabel('SOMETHING') === 'SOMETHING')

  // "Investigate" must not survive as a reader-facing lane word. The enum
  // value itself (quoted, uppercase) is engine code and is allowed.
  const investigate = grep('investigate')
    .filter((l) => !/INVESTIGATE/.test(l))          // enum usage
    .filter((l) => !/canon\.ts|canon-tests/.test(l))
    .filter((l) => !/Investigate before next refresh/.test(l)) // ops log, not a lane
  check('no reader-facing "Investigate" lane term left', investigate.length === 0, investigate.join('\n'))
}

console.log('\n=== §1.4: hero + badges ===')
{
  check('subhead is the spec string',
    HERO_SUBHEAD ===
      'Photograph any room. Your free Check comes back in minutes — with evidence from your photos and at least one thing not to buy.')
  check('subhead makes no account claim', !/account/i.test(HERO_SUBHEAD))
  check('three badges', HERO_BADGES.length === 3)
  check('badges are Free / No account / Costs verified & dated',
    HERO_BADGES.join(' · ') === 'Free · No account · Costs verified & dated', HERO_BADGES.join(' · '))

  // "no account required" in PROSE above the fold — the badge is the only
  // permitted instance, and it is not prose.
  // Scoped to the homepage above-the-fold surface: the page itself, its
  // copy module, and the hero CTA component. Other pages keep their own
  // prose; §1.4 is a homepage assert.
  const aboveFold = grep(
    'no account required',
    'src/app/page.tsx src/lib/check/content.ts src/components/check/CheckCta.tsx'
  )
  check('"no account required" gone from homepage prose', aboveFold.length === 0, aboveFold.join('\n'))
}

console.log('\n=== §1.5: seasonal gate ===')
{
  const may20 = new Date('2026-05-20T12:00:00')
  const jul28 = new Date('2026-07-28T12:00:00')
  const dec1 = new Date('2026-12-01T12:00:00')

  const memorial = SMART_CART_CATEGORIES.find((c) => c.id === 'memorial_day_weekend')!
  const opening = SMART_CART_CATEGORIES.find((c) => c.id === 'opening_the_house')!
  const winterizing = SMART_CART_CATEGORIES.find((c) => c.id === 'winterizing')!
  const deck = SMART_CART_CATEGORIES.find((c) => c.id === 'deck_outdoor')!
  const mudroom = SMART_CART_CATEGORIES.find((c) => c.id === 'mudroom_entry')!

  check('May 20 shows Memorial Day', isActive(memorial, may20))
  check('July 28 does NOT show Memorial Day', !isActive(memorial, jul28))
  check('Dec 1 does NOT show Memorial Day', !isActive(memorial, dec1))
  check('July 28 does NOT show "Opening the house"', !isActive(opening, jul28))

  check('July 28 shows Deck & outdoor', isActive(deck, jul28))
  check('July 28 shows Winterizing', isActive(winterizing, jul28))
  check('July 28 relabels it "Winterizing — early bird"',
    seasonalLabel(winterizing, jul28) === 'Winterizing — early bird', seasonalLabel(winterizing, jul28))
  check('Dec 1 shows plain "Winterizing"',
    seasonalLabel(winterizing, dec1) === 'Winterizing', seasonalLabel(winterizing, dec1))
  check('Dec 1 does NOT show Deck & outdoor', !isActive(deck, dec1))

  check('evergreen chips always render (Mudroom, July)', isActive(mudroom, jul28))
  check('evergreen chips always render (Mudroom, December)', isActive(mudroom, dec1))

  // Wrapping window across the new year.
  const wrap = { from: '11-01', until: '03-31' }
  check('wrapping window includes December', inWindow(wrap, dec1))
  check('wrapping window includes February', inWindow(wrap, new Date('2026-02-14T12:00:00')))
  check('wrapping window excludes July', !inWindow(wrap, jul28))
}

console.log('\n=== §1.3: hero chip row renders all four lanes ===')
{
  const art = grepFixed('MONITOR', 'src/components/check/CheckArt.tsx')
  check('hero illustration carries a MONITOR chip', art.length > 0)
  const blue = grepFixed('#3d4a7a', 'src/components/check/CheckArt.tsx')
  check('MONITOR chip uses the canon blue', blue.length > 0)
}

console.log('\n=== §1.6: beta badge env slot ===')
{
  check('unset → "Free beta" only', betaBadge(undefined) === 'Free beta', betaBadge(undefined))
  check('empty string → "Free beta" only', betaBadge('   ') === 'Free beta')
  check('set → appended',
    betaBadge("Free through Fall '26") === "Free beta · Free through Fall '26",
    betaBadge("Free through Fall '26"))
}

console.log('\n=== CR4: protected copy untouched ===')
{
  // These strings are protected by the spec. Assert they still exist
  // verbatim somewhere in src — a rename or reflow trips this.
  const protectedStrings: Array<[string, string]> = [
    ['hero headline', 'Know what’s worth buying — and what to skip.'],
    ['Why $19.99 module', 'Why $19.99?'],
    ['one sentence helps a lot', 'one sentence helps a lot'],
  ]
  for (const [name, needle] of protectedStrings) {
    const hits = grepFixed(needle)
    check(`protected copy present: ${name}`, hits.length > 0)
  }
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
