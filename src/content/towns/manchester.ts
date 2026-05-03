import type { TownPageContent } from '../templates/town-page-template'

// Manchester — resort_premium tier, but with a split: the Equinox
// area runs at Stowe-tier pricing; the rest of town is mid-tier.
// Bromley/Stratton skiers pull contractor demand. Mountain
// resort + outlet shopping economy creates a unique seasonal
// rhythm.

export const MANCHESTER_CONTENT: TownPageContent = {
  slug: 'manchester-vt',
  townName: 'Manchester',
  county: 'Bennington County',
  townTier: 'resort_premium',
  utility: 'Green Mountain Power (GMP)',
  population: 4317,
  medianHomeValue: 540000,

  metaTitle: 'Manchester, VT property guide — Equinox premium, mid-tier rest of town',
  metaDescription: "Manchester runs two pricing tiers — the Equinox/Manchester Village premium and the mid-tier rest of town. What it actually costs to renovate in 2026. Built for Manchester homeowners.",
  h1: "Manchester, Vermont — two pricing tiers under one zip code.",

  leadParagraph: "Manchester is resort-adjacent in a way that confuses out-of-state cost calculators. The Equinox area, Manchester Village, and the Bromley-side of town run at full Stowe-tier pricing — labor scarcity, design-review prep, second-home premiums. The rest of Manchester runs at small-city tier pricing, with Bennington County's lower contractor rates. Get bids that know the difference.",

  sections: [
    {
      h2: 'Manchester Village vs Manchester Center vs the rest',
      body: `Three sub-markets in one town. Manchester Village (around the Equinox Hotel) is the resort core: design review on Main Street, premium contractor pricing, second-home owners willing to pay schedule premiums.

Manchester Center is the commercial strip — outlet shopping, year-round residents, normal small-city pricing.

The rest of Manchester (the residential streets fanning toward Sunderland, the Bromley road, Equinox Pond) splits the difference based on whether the property is "ski-traffic visible" (premium pricing) or year-round residential (small-city pricing).

**Trap:** the homeowner who gets a bid from a contractor who works mainly in Manchester Village and quotes their normal premium rates for a residential renovation outside the resort core. Ask each bidder where their typical clients are. Mismatched pricing tier means the bid is wrong.`,
    },
    {
      h2: 'Bromley and Stratton ski demand',
      body: `Manchester's contractor schedule is shaped by ski-resort second-home owners. Bromley (10 minutes north) and Stratton (15 minutes south) drive demand for renovation work that needs to be done between ski seasons.

**Vermont-specific:** the spring shoulder (April-May) and fall shoulder (September-October) are peak project windows. Mud season ends and crews start; first snow usually pushes exterior work to a halt. **Worth knowing:** if you want a project running through the November-December window, you're competing with second-home owners trying to finish before the December 25 holiday week. Book by July at the latest.

**Trap:** assuming summer is the easy booking season. Summer is when contractors do their own deferred maintenance and shorter projects. Long renovation projects compete with rental-readying work for ski-season prep. The schedule density in Manchester runs October to April, opposite the typical Vermont pattern.`,
    },
    {
      h2: 'Project costs in Manchester',
      body: `Resort-tier multiplier (1.4× statewide median) applies to Manchester Village and visible-corridor properties. Small-city tier (1.0×) applies to most residential streets. Confirm pricing tier with three bidders before assuming.

**Heat pump install** (small-city pricing) — $11,000-22,000 ducted, $3,500-5,500 single-zone ductless. **Heat pump install** (resort-tier pricing) — $14,000-28,000 ducted. EVT ducted rebate is $2,200; Manchester is in GMP territory so the $2,000-per-condenser income-eligible bonus applies if qualifying.

**Kitchen remodel** (small-city) — $35,000-65,000 mid-range. **Kitchen remodel** (Manchester Village) — $50,000-90,000 mid-range, $120,000+ for full premium spec.

**Bathroom remodel** — $12,000-25,000 small-city, $18,000-35,000 resort tier.

**Roof replacement** — $14,000-32,000 standing seam metal, which is the right call for a 2,500 sq ft roof with snow load engineering for the higher elevations near Bromley.`,
    },
    {
      h2: "ADU and addition timing",
      body: `Vermont Act 47 (effective July 2024) makes ADUs by-right statewide. In Manchester, that overrides the prior 1,000 sq ft local cap. The town can still regulate setbacks, lot coverage, parking — but the size barrier is gone.

**Vermont-specific:** Manchester's design review for Main Street properties applies to ADUs visible from the street. If the ADU is detached and tucked behind the main house, design review is usually skipped. If it's an attached addition or visible from Main Street, expect 4-6 weeks of design review submittal.

**Trap:** the ADU planned as a short-term rental. Manchester has registration and lodging-tax requirements for short-term rentals. If your ADU plan is to put it on Airbnb, factor in $500/year town STR permit, town zoning bylaw on STRs (verify current rules), and the lodging-tax compliance. Talk to the town zoning office before designing.`,
    },
  ],

  faq: [
    {
      question: 'Why are bids in Manchester Village so much higher than the rest of Manchester?',
      answer: 'Three pricing tiers exist in one town. Manchester Village (resort core) runs at Stowe-tier pricing because labor demand and design review prep are real costs there. Manchester Center and most residential streets run at small-city pricing. Confirm with each bidder which tier they typically work in.',
    },
    {
      question: 'When is the best time to book a Manchester renovation contractor?',
      answer: "April-July for fall starts. Manchester's contractor schedule is opposite typical Vermont patterns — driven by Bromley/Stratton ski-resort second-home owners who need work done outside ski season. Summer isn't quiet here; it's deferred-maintenance and rental-prep season.",
    },
    {
      question: 'Is design review required for an ADU in Manchester?',
      answer: 'Only if the ADU is visible from a Main Street public way. Detached ADUs tucked behind the main house typically skip design review. Attached additions or street-visible ADUs need design review submittal — add 4-6 weeks.',
    },
    {
      question: 'What do I need to know about short-term-renting an ADU in Manchester?',
      answer: 'Town STR permit (~$500/year), town zoning bylaw on STR allowances (verify current rules with town zoning), and Vermont state lodging tax compliance. Plan the registration before you build, not after.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'gmp-heat-pump-income-bonus',
    'vt-act-47-adu',
    'vt-tier-resort-premium',
    'vt-cost-heat-pump-ducted',
    'vt-cost-kitchen-mid',
    'vt-cost-roof-standing-seam',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-much-does-kitchen-remodel-cost-vermont',
    'vermont-renovation-permit-guide',
    'how-much-does-roof-replacement-cost-vermont',
    'how-to-find-contractor-vermont',
  ],

  relatedServiceSlugs: [],

  sampleAddress: 'Main Street, Manchester, VT',
  samplePropertySlug: 'main-street-manchester-vt',

  verifyDate: '2026-05-03',
}
