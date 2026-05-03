import type { TownPageContent } from '../templates/town-page-template'

// Burlington — burlington_metro tier. Vermont's largest city, but
// "largest" here is 50k people in a 130k metro. The Burlington
// Electric Department (BED) runs its own incentives that route
// through EVT differently than GMP territory. Old housing stock
// drives unique cost issues — knob-and-tube wiring, oversized
// chimneys, postage-stamp lots in the Hill Section.

export const BURLINGTON_CONTENT: TownPageContent = {
  slug: 'burlington-vt',
  townName: 'Burlington',
  county: 'Chittenden County',
  townTier: 'burlington_metro',
  utility: 'Burlington Electric Department (BED)',
  population: 44781,
  medianHomeValue: 425000,

  metaTitle: 'Burlington, VT property guide — costs, rebates, BED rebates',
  metaDescription: "What it actually costs to renovate, weatherize, and upgrade a Burlington property in 2026. BED vs GMP rebate differences, Hill Section permits, lake-zone setbacks. Built for Burlington homeowners.",
  h1: "Burlington, Vermont — old housing stock, BED rebates, lake-side setbacks.",

  leadParagraph: "Vermont's largest housing market — but 'largest' here means 50,000 people, with about 70% of the housing stock pre-dating 1960. That ages-out drives the cost math: knob-and-tube wiring, oil-to-electric conversions, and undersized service panels turn a kitchen remodel into an electrical project. Burlington Electric Department (BED) runs its own incentive layer that doesn't always stack the way out-of-state contractors expect.",

  sections: [
    {
      h2: "Why Burlington's old housing drives cost",
      body: `Most Burlington homes north of Pearl Street and across the Hill Section were built between 1880 and 1940. That means: knob-and-tube wiring still in place behind walls, undersized 100-amp electrical service, plaster-and-lath construction that complicates any wall opening, and oil heat as the default.

**Trap:** the kitchen remodel quote that doesn't include electrical service upgrade. A typical 1920s Burlington home has 100-amp service and a federal-Pacific or Zinsco panel that any honest electrician will refuse to add circuits to. Adding kitchen circuits — induction range, dishwasher, microwave — usually pushes the panel past code. Plan on $3,500-7,500 for a 200-amp service upgrade, separate from the kitchen scope. The good news: EVT rebates $500 toward an electrical service upgrade tied to electrification.

Plaster-and-lath isn't a deal-breaker but it changes the demolition phase. Drywall finishers used to plaster need to know how to feather modern joint compound onto century-old skim coats. Ask contractors how they handle plaster transitions before you sign.`,
    },
    {
      h2: "BED vs GMP — why your friend's rebate doesn't apply here",
      body: `Burlington Electric Department (BED) is a municipal utility. Burlington's homeowners get electric service from BED, not Green Mountain Power. The rebate landscape changes accordingly.

EVT statewide rebates apply the same: $2,200 ducted heat pump rebate (verified April 2026), $475 per ductless head, $400 fuel-switching bonus, $600 heat pump water heater. Those are paid by EVT regardless of utility.

**Vermont-specific:** GMP's $2,000-per-condenser income-eligible bonus does NOT apply to BED customers. Your friend in Shelburne tells you they got $4,200 plus $2,000 from GMP — $6,200 total. In Burlington, the same install nets $4,200, no GMP bonus on top. BED has its own incentive layer that's narrower.

**Trap:** the contractor who quotes you $4,200 in stacked rebates assuming GMP territory. Confirm in writing which rebates are real for a BED customer. Have the contractor name them line by line. If they can't, they don't know your local rebate stack.`,
    },
    {
      h2: 'Lake-side setbacks if you face Champlain',
      body: `Burlington's lakeside neighborhoods — North Beach, the New North End along Battery, parts of the South End — are inside Vermont's 250-foot Shoreland Protection Act buffer. Any clearing, building, or new impervious surface within the buffer triggers a state shoreland permit on top of city permits.

**Trap:** the deck addition in the back yard that you assume is fine because it's not on the water. If the back yard is within 250 feet of Lake Champlain, the buffer applies. Even if there's a building between your deck and the lake, the buffer is measured from the high-water mark, not from line-of-sight to the water.

Run your address through the Vermont ANR Atlas before signing any addition contract. **Verify with** the city zoning office for setbacks and the state DEC for shoreland permit requirements.`,
    },
    {
      h2: 'Project costs in Burlington',
      body: `Burlington runs roughly 1.1-1.2× statewide median. As of mid-2026:

**Kitchen remodel** — $40,000-75,000 mid-range, $90,000-130,000 full gut. The Hill Section premiums add another 10-15% above metro median.

**Bathroom remodel** — $14,000-32,000 mid-range. Half-to-full bath conversions in older homes often hit the high end because the existing 4-inch waste line wasn't sized for a tub.

**ADU build** — $90,000-180,000 for a 700-900 sq ft unit. Most Burlington lots are tight; setbacks are the binding constraint, not the building. Vermont Act 47 makes ADUs by-right statewide, including in Burlington.

**Whole-home weatherization** — $4,000-18,000 typical, with EVT 75% rebate (standard tier) bringing your out-of-pocket to $1,000-4,500. **Worth knowing:** Burlington's pre-1960 housing stock is the highest-value market for weatherization in Vermont. Your payback period from weatherization here is typically half what it is on a 1990s build.`,
    },
  ],

  faq: [
    {
      question: 'Are BED customers eligible for the same heat pump rebates as GMP customers?',
      answer: 'For EVT-paid rebates, yes — $2,200 ducted, $475 per ductless head, $400 fuel-switching bonus apply equally. For utility-paid bonuses on top, no — GMP\'s $2,000 income-eligible bonus does NOT apply in BED territory. BED has its own narrower incentive layer.',
    },
    {
      question: 'Do I need a state shoreland permit for an addition in the New North End?',
      answer: "If your project is within 250 feet of Lake Champlain's high-water mark, yes. The buffer is measured from the lake, not from line-of-sight, so a back-yard project on a small lot near the water often falls inside. Run your address through the Vermont ANR Atlas before bidding.",
    },
    {
      question: 'How much does a 200-amp electrical service upgrade cost in Burlington?',
      answer: '$3,500-7,500 typical. Older Burlington homes with knob-and-tube and federal-Pacific panels often need a full service replacement before adding kitchen or HVAC circuits. EVT rebates $500 toward the upgrade if it\'s tied to a heat pump or EV charger install.',
    },
    {
      question: 'Can I do an ADU on my Hill Section lot?',
      answer: "Probably yes. Vermont Act 47 (effective July 2024) overrides most local ADU caps. The binding constraint in the Hill Section is usually setbacks and lot coverage — Hill Section lots are small. Talk to Burlington zoning before signing anything; the math is lot-specific.",
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-electrical-service-upgrade',
    'evt-heat-pump-water-heater',
    'evt-weatherization-standard-tier',
    'vt-act-47-adu',
    'vt-shoreland-buffer',
    'vt-tier-burlington-metro',
    'vt-cost-kitchen-mid',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-much-does-kitchen-remodel-cost-vermont',
    'vermont-flood-zone-renovation',
    'vermont-renovation-permit-guide',
    'how-to-find-contractor-vermont',
  ],

  relatedServiceSlugs: [
    'kitchen-remodeling-burlington-vt',
    'bathroom-remodeling-burlington-vt',
    'roofing-burlington-vt',
    'window-replacement-burlington-vt',
    'home-additions-burlington-vt',
    'electrical-contractors-burlington-vt',
  ],

  sampleAddress: 'Main Street, Burlington, VT',
  samplePropertySlug: 'main-street-burlington-vt',

  verifyDate: '2026-05-03',
}
