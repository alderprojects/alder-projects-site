/**
 * v7.2.19 — pre_listing_curb_appeal scope catalog.
 * High commercial intent: pre-sale homeowners, real money in the answer.
 * Follows the same shape as other scope catalogs (memorial_day_weekend, grill_purchase).
 *
 * NOTE: Wire this into your scope registry at the existing path
 *       (src/lib/scopes/*.ts or wherever scope catalogs live).
 *       This file is the catalog content payload.
 */

export const PRE_LISTING_CURB_APPEAL = {
  id: 'pre_listing_curb_appeal',
  topic: 'outdoor',
  label: 'Pre-Listing Curb Appeal',
  smartCartReady: true,
  shortDescription: 'The exterior fixes that move appraisal vs the ones that don\'t — before listing your Vermont home.',
  longDescription: 'A 60-day pre-listing exterior refresh. Mulch, paint touch-ups, front door, landscape edge, and the three high-ROI moves that show up in appraiser photos. Everything else is on the skip list because it does not earn its cost back at sale.',

  scenarios: ['just_starting', 'tight_budget', 'premium_picks', 'already_started'],

  // Lean Cart — the 5 moves that actually return ROI
  picks: [
    {
      role: 'mulch',
      tier1: { brand: 'Bulk hardwood mulch', priceLow: 25, priceHigh: 45, unit: '2 cu yd delivered' },
      tier2: { brand: 'Bagged dyed brown mulch', priceLow: 35, priceHigh: 60, unit: '10 bags' },
      tier3: { brand: 'Bulk premium dyed mulch', priceLow: 70, priceHigh: 120, unit: '3 cu yd delivered' },
      note: 'Fresh dark mulch around foundation plantings is the single highest-ROI exterior move. Apply 7–14 days before photos.',
    },
    {
      role: 'front_door_paint',
      tier1: { brand: 'Mid-tier exterior paint, 1 qt', priceLow: 18, priceHigh: 28, unit: 'one door + trim' },
      tier2: { brand: 'Benjamin Moore Aura Exterior, 1 qt', priceLow: 28, priceHigh: 42, unit: 'one door + trim' },
      tier3: { brand: 'Fine Paints of Europe Hollandlac, 500ml', priceLow: 60, priceHigh: 95, unit: 'one door + trim' },
      note: 'A bold front door color (deep green, navy, charcoal) is appraiser bait. Skip the bright accent colors of 2018 — they read dated now.',
    },
    {
      role: 'house_number',
      tier1: { brand: 'Generic 4" black numbers', priceLow: 12, priceHigh: 24, unit: '4 numbers' },
      tier2: { brand: 'Modern brass or matte black 5" numbers', priceLow: 30, priceHigh: 60, unit: '4 numbers' },
      tier3: { brand: 'Custom-painted ceramic tile numbers', priceLow: 80, priceHigh: 160, unit: '4 numbers' },
      note: 'Visible, large, contemporary house numbers signal a maintained home in drive-by photos.',
    },
    {
      role: 'landscape_edge',
      tier1: { brand: 'Half-moon edger (rental)', priceLow: 15, priceHigh: 25, unit: '1 day rental' },
      tier2: { brand: 'Steel landscape edging, 40 ft', priceLow: 50, priceHigh: 90, unit: '40 linear ft' },
      tier3: { brand: 'Belgian block stone edging', priceLow: 200, priceHigh: 400, unit: '40 linear ft' },
      note: 'A clean line between lawn and bed is the visual cue most appraisers read as "maintained." Crisp edges, then mulch.',
    },
    {
      role: 'front_walk_pressure_wash',
      tier1: { brand: 'Pressure washer rental, 1 day', priceLow: 60, priceHigh: 90, unit: '1 day' },
      tier2: { brand: 'Pressure washer rental + concrete cleaner', priceLow: 90, priceHigh: 140, unit: '1 day + cleaner' },
      tier3: { brand: 'Pro pressure wash service', priceLow: 200, priceHigh: 450, unit: 'walk + drive + steps' },
      note: 'A clean concrete walk reads new in photos. Algae and stains on stone or concrete drop perceived condition.',
    },
  ],

  optional: [
    {
      role: 'door_hardware',
      tier1: { brand: 'Mid-tier matte black handleset', priceLow: 45, priceHigh: 75, unit: '1 set' },
      tier2: { brand: 'Schlage or Baldwin handleset', priceLow: 90, priceHigh: 160, unit: '1 set' },
      note: 'Worth it if your existing handleset is brass and dated.',
    },
    {
      role: 'porch_lighting',
      tier1: { brand: 'Mid-tier dark bronze sconce', priceLow: 35, priceHigh: 70, unit: '1 fixture' },
      tier2: { brand: 'Restoration-style lantern sconce', priceLow: 90, priceHigh: 180, unit: '1 fixture' },
      note: 'Skip if existing lighting works and is not visibly dated.',
    },
    {
      role: 'planters_and_annuals',
      tier1: { brand: 'Two large planters + annuals', priceLow: 60, priceHigh: 120, unit: 'pair flanking door' },
      note: 'Boxwood balls or single-color trailing flowers read cleanest in photos.',
    },
  ],

  skips: [
    {
      label: 'Skip full lawn replacement before listing',
      amountSaved: '$800-3,500',
      reasoning: 'A new lawn does not finish establishing for 60+ days and shows patchy in photos. Spot-seed bare patches with a quick-germinate mix instead. $20 of seed beats $2,000 of sod for appraisal photos.',
    },
    {
      label: 'Skip premium landscape stone or river rock beds',
      amountSaved: '$400-1,200',
      reasoning: 'Stone beds read trendy in 2026 but appraisers do not give them more credit than mulch. Mulch refreshes annually; stone you are stuck with. The buyer also has to replace stone if they do not like the color.',
    },
    {
      label: 'Skip the trendy front door color (red, yellow, teal)',
      amountSaved: '$0-50',
      reasoning: 'Highly saturated colors date the photos. Deep green, navy, charcoal, black, or a warm wood stain all photograph better and appeal to a broader buyer pool. Same cost, better return.',
    },
    {
      label: 'Skip outdoor smart lighting systems',
      amountSaved: '$300-800',
      reasoning: 'Smart outdoor lighting hubs do not transfer cleanly to new owners and have a 50/50 chance of being torn out. A simple wall switch on a timer does the same listing-photo job.',
    },
    {
      label: 'Skip ornamental wrought-iron flower boxes and decor',
      amountSaved: '$150-450',
      reasoning: 'Style-specific decor reads dated quickly and can shrink your buyer pool. Keep it neutral: planters with one color of annuals beats themed seasonal decor every time.',
    },
    {
      label: 'Skip the seal-coat driveway service if your driveway is functional',
      amountSaved: '$200-600',
      reasoning: 'Seal-coating an asphalt driveway 30 days before listing looks good in photos for 2 weeks, then black streaks form. If the driveway has structural issues, fix them. If it looks tired but is intact, pressure wash and move on.',
    },
  ],

  waitList: [
    {
      label: 'Mulch and bagged soil',
      bestMonth: 'July',
      reasoning: 'Hardware-store mulch and soil drops 25-40% in late July as garden centers clear inventory before fall. If you are listing in September+, wait. If listing earlier, buy now.',
    },
    {
      label: 'Exterior paint',
      bestMonth: 'August-September',
      reasoning: 'Premium exterior paint lines (Benjamin Moore Aura, Sherwin-Williams Emerald) discount 15-25% in late summer. If listing in fall, wait. If listing in spring/early summer, buy now and finish before photos.',
    },
    {
      label: 'Outdoor planters',
      bestMonth: 'Late August',
      reasoning: 'End-of-summer clearance brings planters down 30-50%. Only worth waiting if your listing timeline permits.',
    },
  ],

  routeOuts: [
    {
      condition: 'Major foundation, roof, or siding issues visible from the street',
      direction: 'Skip the cart. These are inspector and appraiser blockers. Address the structural issue OR price the home accordingly. Curb appeal cannot hide major systems problems.',
    },
    {
      condition: 'Dead or dying mature trees within 30 feet of the house',
      direction: 'Skip the cart. Hire an arborist for assessment first. Buyer inspections will flag this and tree removal runs $1,500-5,000+ — bake into pricing or remove before listing.',
    },
    {
      condition: 'Heaved or cracked walkway / driveway',
      direction: 'Skip pressure-washing alone. Get a concrete estimate. Crack repair runs $500-2,500; full replacement $5,000+. Disclose either way.',
    },
  ],

  savingsSnapshot: {
    leanCartTypical: '$140-280',
    optionalAddOns: '$135-400',
    typicalAvoidedSpend: '$1,500-4,500',
    headlinerNumber: '$2,000+ saved on the moves that do not earn appraisal credit',
  },

  valueProposition: 'Most pre-listing exterior advice tells you to spend $5K-10K on curb appeal. The honest answer: $200-500 of mulch, paint, hardware, and pressure washing returns 90% of the appraisal lift. The rest is either invisible to appraisers or actively shrinks your buyer pool. This cart picks the moves that move appraisal — and names the ones that do not.',
}
