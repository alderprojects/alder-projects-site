// Single source of truth for the structured "Trap:" callouts that
// appear across guides, town pages, and the V7 Smart Cart / Worth-It
// Plan engine.
//
// Inline "Trap:" prose callouts in V6 guides remain free-form (rule 3
// of voice-guide.md). This module is the citation layer: V7 Move
// records and SCOPE_VARIANT.overbuyTrapIds reference traps by id, and
// content modules can render a Trap entry consistently when they need
// the structured 3-part form (cost-of-being-wrong, why people fall in,
// workaround).
//
// Authored to voice-guide.md rule 3:
//   1. Cost-of-being-wrong in dollars or hours
//   2. Why people fall in (sensible-seeming default that's wrong here)
//   3. Workaround in one sentence
//
// Pages SHOULD import and render TRAPS where they need a consistent
// callout — never hardcode trap text twice.
//
// verifyDate: when this trap was last reviewed for accuracy.

import type { TopicId } from '../lib/property-modules'

export type TrapCategory =
  | 'overbuy'        // shopping cart traps — premium kits, bulk before measuring
  | 'contractor'     // contract, lien, scope, change-order
  | 'timing'         // mud season, peak pricing, end-of-season
  | 'permit'         // building permits, design review, shoreland
  | 'diy'            // jobs that look DIY but flip on inspection
  | 'rebate'         // rebate stacking, deadlines, eligibility
  | 'lien'           // mechanic's lien, title issues
  | 'general'        // cross-topic

export type Trap = {
  id: string
  topic: TopicId | 'general'
  category: TrapCategory
  title: string                  // short label
  costOfBeingWrong: string       // "$200-2,000" or "1-2 weekends"
  whyPeopleFall: string          // sensible-seeming default
  workaround: string             // one-sentence fix
  relatedFactIds?: string[]
  verifyDate: string             // ISO YYYY-MM-DD
  notes?: string
}

export const TRAPS: Record<string, Trap> = {
  // ---------- Contractor / contract / lien ----------------------------
  'homeowner-pulled-permit': {
    id: 'homeowner-pulled-permit',
    topic: 'general',
    category: 'permit',
    title: 'Pulling the building permit yourself',
    costOfBeingWrong: '$2,000-15,000 in code-correction work and personal liability',
    whyPeopleFall: 'The contractor offers to save you the $200 permit fee. It feels like a courtesy.',
    workaround: 'Insist on a contractor-pulled permit even if it costs more — the person whose name is on the permit owns the code-compliance liability.',
    verifyDate: '2026-04-15',
  },

  'expired-quote-lumber-jump': {
    id: 'expired-quote-lumber-jump',
    topic: 'general',
    category: 'contractor',
    title: 'Signing past the quote expiration window',
    costOfBeingWrong: '$1,500-8,000 in pass-through material increases',
    whyPeopleFall: 'The quote says "valid for 30 days" but you take three weeks to compare bids. Lumber, copper, and shingles can move 8-15% in those weeks.',
    workaround: 'Sign within 7 days of quote, or ask in writing for a price-lock with a 14-day window before the contractor reorders materials.',
    verifyDate: '2026-04-15',
  },

  'unsigned-change-orders': {
    id: 'unsigned-change-orders',
    topic: 'general',
    category: 'contractor',
    title: 'Verbal change orders during the build',
    costOfBeingWrong: '$3,000-25,000 in disputed billing on a mid-size project',
    whyPeopleFall: 'The crew is on site, you decide on a different tile, the lead nods, work continues. Nobody wants to interrupt momentum to write it down.',
    workaround: 'Refuse to verbally approve any change. Email a one-line confirmation with the dollar delta before the crew lifts a tool — even if you trust them.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-residential-contract-statute'],
  },

  'mechanics-lien-from-unpaid-sub': {
    id: 'mechanics-lien-from-unpaid-sub',
    topic: 'general',
    category: 'lien',
    title: "Sub puts a mechanic's lien on your title",
    costOfBeingWrong: '$5,000-50,000+ depending on sub balance — title is unclear until cleared',
    whyPeopleFall: 'You paid the GC in full. The GC stiffed the drywall sub. Vermont law lets the sub lien YOUR property even though you paid.',
    workaround: 'Require signed lien waivers from every sub and supplier before you release each progress payment, not just the final.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-mechanics-lien-statute'],
  },

  'unregistered-contractor-3500-job': {
    id: 'unregistered-contractor-3500-job',
    topic: 'contractor_vetting',
    category: 'contractor',
    title: 'Hiring a contractor who skips VT AG registration',
    costOfBeingWrong: 'No CAP recourse if the job goes sideways — you eat the loss',
    whyPeopleFall: 'They came recommended, the price is right, registration sounds like paperwork.',
    workaround: 'Ask for the VT AG registration number and verify it at ago.vermont.gov/cap before signing — it is free for them and required for any residential job over $3,500.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-contractor-registration-threshold'],
  },

  // ---------- Permits / regulators ------------------------------------
  'shoreland-buffer-clearing': {
    id: 'shoreland-buffer-clearing',
    topic: 'flood_zone',
    category: 'permit',
    title: 'Clearing or building inside the 250-foot lake buffer',
    costOfBeingWrong: '$2,000-25,000 in DEC fines plus replant orders',
    whyPeopleFall: 'You own the land, the brush is on your land, the dock just needs a path. Nobody told you the Shoreland Protection Act ran past your property line in.',
    workaround: 'Pull the DEC Shoreland map for your parcel before clearing, building, or pouring impervious surface within 250 feet of any lake larger than 10 acres.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-shoreland-buffer'],
  },

  'mountain-road-design-review': {
    id: 'mountain-road-design-review',
    topic: 'general',
    category: 'permit',
    title: 'Skipping the Stowe Mountain Road design review',
    costOfBeingWrong: '$1,500-3,000 in unbudgeted design-review prep, plus 2-6 weeks of delay',
    whyPeopleFall: 'Your contractor quoted a clean number for the rebuild. The bid did not include design-review submittal time, and the property sits in the overlay.',
    workaround: 'Call the town clerk Monday morning and ask whether your lot is in the design-review overlay before signing — if it is, the contractor bid should already include prep time.',
    verifyDate: '2026-04-15',
  },

  'grievance-window-missed': {
    id: 'grievance-window-missed',
    topic: 'property_tax',
    category: 'timing',
    title: 'Missing the property assessment grievance window',
    costOfBeingWrong: '$300-4,000 in over-assessed property tax for the year',
    whyPeopleFall: 'The reassessment notice arrives in a stack of mail. Most towns give you 14 days. By the time you read it carefully, the window closed.',
    workaround: 'Open any envelope from the listers within a week, calendar the grievance deadline, and file even a one-page appeal letter if the new value looks wrong.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-grievance-window'],
  },

  // ---------- Timing / season -----------------------------------------
  'mud-season-contractor-disappear': {
    id: 'mud-season-contractor-disappear',
    topic: 'mud_season',
    category: 'timing',
    title: 'Booking outdoor work into mud season',
    costOfBeingWrong: '4-8 weeks of project delay during peak DIY season',
    whyPeopleFall: 'You signed in February, the contractor said April start. April hits and the truck cannot legally drive your dirt road.',
    workaround: 'Ask the contractor in writing how mud-season weight limits affect your road, and pad the schedule to mid-May for any heavy-truck work.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-mud-season-window'],
  },

  'patio-furniture-peak-pricing': {
    id: 'patio-furniture-peak-pricing',
    topic: 'outdoor',
    category: 'timing',
    title: 'Buying patio furniture in May',
    costOfBeingWrong: '30-60% pricing premium versus August clearance',
    whyPeopleFall: 'The deck is finally usable, the catalogs land, and the cushions are right there.',
    workaround: 'Buy outdoor furniture and cushions in late August through early September clearance, then store one season — Vermont winters are kind to indoor-stored Sunbrella.',
    verifyDate: '2026-04-15',
  },

  'snow-blower-november-rush': {
    id: 'snow-blower-november-rush',
    topic: 'general',
    category: 'timing',
    title: 'Buying a snow blower the week before the first storm',
    costOfBeingWrong: '$200-600 over August / late-spring pricing',
    whyPeopleFall: 'The forecast turns and inventory is right there at the hardware store.',
    workaround: 'Buy snow blowers and outdoor power equipment in late spring or early summer when shops clear last year stock — same machine, often $200-600 less.',
    verifyDate: '2026-04-15',
  },

  // ---------- Rebate / eligibility ------------------------------------
  'evt-rebate-paid-to-contractor': {
    id: 'evt-rebate-paid-to-contractor',
    topic: 'rebate_strat',
    category: 'rebate',
    title: 'Expecting an EVT check in the mail',
    costOfBeingWrong: 'Cash-flow surprise of $2,000-7,000',
    whyPeopleFall: '"Get $2,200 back from EVT" reads like a refund check is coming. EVT actually pays the contractor; you see it as a net invoice line.',
    workaround: 'Confirm with the installer before signing that the EVT rebate is netted against your invoice, not paid to you separately — and budget the gross install cost minus rebate, not the gross plus a future check.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['evt-ducted-heat-pump-rebate', 'evt-ductless-heat-pump-rebate'],
  },

  'federal-25c-still-quoted': {
    id: 'federal-25c-still-quoted',
    topic: 'rebate_strat',
    category: 'rebate',
    title: 'Stacking the expired federal 25C credit',
    costOfBeingWrong: '$300-1,200 in expected credit that no longer exists',
    whyPeopleFall: 'Older blog posts and contractor quotes still cite the 30% federal credit on insulation and windows. It expired December 31, 2025.',
    workaround: 'Treat any quote citing the federal 25C credit on weatherization as out of date — verify against IRS energystar.gov and recompute total project cost without it.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['federal-25c-expired'],
  },

  'homestead-declaration-late': {
    id: 'homestead-declaration-late',
    topic: 'property_tax',
    category: 'timing',
    title: 'Missing the April 15 Homestead Declaration',
    costOfBeingWrong: '$500-1,000+ paid at non-homestead rate for the year',
    whyPeopleFall: 'You filed your federal 1040 by April 15 and assumed the Vermont homestead piece was bundled. It is a separate form.',
    workaround: 'File HS-122 by April 15 every year you live in the home, even if your federal filing extends — the homestead designation drives the property tax rate for the whole year.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-homestead-declaration-deadline', 'vt-property-tax-credit-form'],
  },

  // ---------- DIY-overestimation --------------------------------------
  'diy-faucet-without-shutoff-test': {
    id: 'diy-faucet-without-shutoff-test',
    topic: 'kitchen',
    category: 'diy',
    title: 'Pulling the old faucet before testing the shutoff valves',
    costOfBeingWrong: '$200-1,500 for an emergency plumber visit',
    whyPeopleFall: 'The new faucet arrived, the YouTube video makes it look like 20 minutes. The shutoffs under most Vermont kitchen sinks have not been turned in 15-30 years.',
    workaround: 'Turn each shutoff fully off, then turn the faucet on at full hot and full cold — if water still trickles after a minute, the shutoff is failed and you need a plumber before you start.',
    verifyDate: '2026-04-15',
  },

  'diy-electrical-without-permit': {
    id: 'diy-electrical-without-permit',
    topic: 'kitchen',
    category: 'diy',
    title: 'DIY electrical work that fails inspection at sale',
    costOfBeingWrong: '$1,000-6,000 in re-wiring at sale time',
    whyPeopleFall: 'Adding an outlet or under-cabinet LED feels like a small DIY job. Vermont code still requires a licensed electrician sign-off for most permitted electrical work, and an unsigned addition surfaces during a buyer inspection.',
    workaround: 'For anything beyond direct fixture replacement, pull a permit and have a licensed electrician inspect — the $200 inspection now is cheaper than the rewire later.',
    verifyDate: '2026-04-15',
  },

  // ---------- Overbuy / cart-shape (V7 SmartCart references) ----------
  'all-in-one-cabinet-refresh-kit': {
    id: 'all-in-one-cabinet-refresh-kit',
    topic: 'kitchen',
    category: 'overbuy',
    title: 'The premium "all-in-one" cabinet refresh kit',
    costOfBeingWrong: '$60-160 above lean-cart equivalent',
    whyPeopleFall: 'It is on the endcap, the box says "everything you need", and you would rather not assemble a cart of separate items.',
    workaround: 'Buy the deglosser, brush set, and primer separately — the all-in-one kit doubles up on items you already own and bundles a primer that does not match Vermont basement humidity.',
    verifyDate: '2026-04-15',
  },

  'smart-thermostat-before-air-sealing': {
    id: 'smart-thermostat-before-air-sealing',
    topic: 'weatherization',
    category: 'overbuy',
    title: 'Buying a $280 smart thermostat before air-sealing the rim joists',
    costOfBeingWrong: '$200-260 in marginal value lost',
    whyPeopleFall: 'The smart thermostat is the visible, satisfying purchase. Air-sealing is the boring, dusty one.',
    workaround: 'Air-seal the rim joists and attic plate first — a $25 caulk gun and three cans of foam beats a $280 thermostat for measurable Vermont winter comfort gain.',
    verifyDate: '2026-04-15',
  },

  'bulk-insulation-before-measuring': {
    id: 'bulk-insulation-before-measuring',
    topic: 'weatherization',
    category: 'overbuy',
    title: 'Bulk-buying insulation rolls before measuring',
    costOfBeingWrong: '$80-300 in returns, store-credit-only stock, or rolls that sit in the basement',
    whyPeopleFall: 'The contractor pack is on sale, the math feels close enough.',
    workaround: 'Measure each cavity end-to-end and add 8% waste before buying — return policies on opened rolls in Vermont hardware stores are stricter than national chains suggest.',
    verifyDate: '2026-04-15',
  },

  // ---------- Heat pump / cold-climate sequencing ---------------------
  'heat-pump-before-air-sealing': {
    id: 'heat-pump-before-air-sealing',
    topic: 'heat_pump',
    category: 'general',
    title: 'Sizing the heat pump for the un-weatherized house',
    costOfBeingWrong: '$3,000-9,000 in oversized equipment plus higher operating cost',
    whyPeopleFall: 'You want the heat pump now and the air-sealing is on next year list. The installer sizes for the load they walked into.',
    workaround: 'Air-seal and add attic insulation first, then have the heat pump sized to the new load — Vermont 7,500-8,500 HDD makes this sequence pay back inside 2-4 years.',
    verifyDate: '2026-04-15',
    relatedFactIds: ['vt-heating-degree-days', 'evt-weatherization-standard-tier'],
  },
}

// ---------- Helpers ----------------------------------------------------

// Render a trap as the canonical 3-part callout. Returns the structured
// pieces; consumers compose the prose (or a block component) themselves.
export function renderTrap(id: string): Pick<Trap, 'title' | 'costOfBeingWrong' | 'whyPeopleFall' | 'workaround'> {
  const t = TRAPS[id]
  if (!t) throw new Error(`Unknown trap id: ${id}`)
  return {
    title: t.title,
    costOfBeingWrong: t.costOfBeingWrong,
    whyPeopleFall: t.whyPeopleFall,
    workaround: t.workaround,
  }
}

// Filter TRAPS by topic. Returns traps whose topic matches OR is 'general'.
export function getTrapsForTopic(topic: TopicId): Trap[] {
  return Object.values(TRAPS).filter(t => t.topic === topic || t.topic === 'general')
}

// Filter TRAPS by category — used by V7 SmartCart synthesis to pull only
// 'overbuy' traps when computing the savings snapshot.
export function getTrapsByCategory(category: TrapCategory): Trap[] {
  return Object.values(TRAPS).filter(t => t.category === category)
}

// Resolve a list of trap ids to full Trap records.
export function getTrapsByIds(ids: string[]): Trap[] {
  return ids.map(id => TRAPS[id]).filter(Boolean)
}

// All trap ids — for build-time sanity checks.
export function allTrapIds(): string[] {
  return Object.keys(TRAPS)
}
