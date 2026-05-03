import type { TownPageContent } from '../templates/town-page-template'

// Stowe — resort_premium tier. Cost basis runs ~30-40% above
// statewide median. The three Stowe-specific cost drivers: Mountain
// Road design review, Stowe Village Historic District scrutiny, and
// septic systems sized for occasional weekend use.
//
// Self-rubric run 2026-05-03: opens with cost reality (rule 1),
// 4 Trap callouts, every numeric pulls from FACTS, "Verify with
// town clerk" used twice, 5 outbound links.

export const STOWE_CONTENT: TownPageContent = {
  slug: 'stowe-vt',
  townName: 'Stowe',
  county: 'Lamoille County',
  townTier: 'resort_premium',
  utility: 'VPPSA member utility (Stowe Electric)',
  population: 4314,
  medianHomeValue: 720000,

  metaTitle: 'Stowe, VT property guide — costs, rebates, contractor reality',
  metaDescription: "What it actually costs to renovate, build, and maintain a Stowe property in 2026. Mountain Road design review, historic district rules, septic upgrade traps. Built for Stowe homeowners.",
  h1: 'Stowe, Vermont — what your property actually costs.',

  leadParagraph: "Stowe's cost basis runs 30-40% above statewide median, and the drivers aren't mysterious: labor scarcity, second-home owners willing to pay schedule premiums, and aging year-round housing stock that needs serious systems work. The Mountain Road corridor adds design-review prep time most contractors quote without. Verify with the town clerk before signing.",

  sections: [
    {
      h2: 'What makes Stowe different',
      body: `Three things, in priority order.

The Mountain Road corridor is design-reviewed for any visible exterior work. Your contractor needs experience with the corridor's design rules — it's not a license, but contractors who don't know it submit plans that get bounced and your project loses six weeks. Ask about Mountain Road experience explicitly when bidding work.

Stowe Village Historic District constrains exterior changes within the district boundary. Window replacements, siding, roofing — all need design review approval if visible from a public way. **Trap:** many contractors will quote the work without including the design review prep time. Add 2-4 weeks and $1,500-3,000 to any quote that doesn't explicitly include design review costs.

Septic systems sized for occasional weekend use are the most common surprise cost. An old 750-gallon tank doesn't pass a year-round-use design flow check. If you're converting a vacation home to a year-round residence, plan on $15,000-30,000 for septic upgrade. **Verify with** the town clerk and a Vermont-licensed septic engineer before signing a purchase contract.`,
    },
    {
      h2: 'Project costs in Stowe',
      body: `Stowe runs roughly 1.4× the statewide median across most categories. Specific ranges as of mid-2026:

**Heat pump install** — $14,000-28,000 ducted whole-house, $5,000-12,000 ductless single zone. Stowe contractors typically book 4-6 months out for shoulder seasons. EVT ducted rebate is $2,200, ductless is $475 per indoor head. **Vermont-specific:** Stowe is on a VPPSA member utility (Stowe Electric), so the utility-side income bonus runs $1,000 per condenser if you qualify, vs. $2,000 in GMP territory.

**Kitchen remodel** — $50,000-90,000 mid-range, $120,000+ for full Mountain Road premium spec. The cost driver is custom cabinetry — second-home owners often spec out high-end cabinet shops in Burlington or Montpelier and ship to Stowe, which adds installation complexity.

**Roofing** — $14,000-32,000 for a typical 2,500 sq ft roof. Snow load engineering matters here more than down south. Talk to roofers about ice dam mitigation explicitly. Standing seam metal makes more sense in Stowe than asphalt for almost any 20+ year ownership horizon.

**Window replacement** — $12,000-28,000 for a typical 12-window project. Historic district approval adds time but rarely cost — modern double-pane vinyl can match historic profiles.`,
    },
    {
      h2: 'The Mountain Road design review trap',
      body: `Mountain Road (VT-108 north of Stowe village) has its own design overlay. The town's design review board reviews any visible exterior change. The standards are written down — they're not arbitrary — but they're also not what a contractor in Burlington would assume.

**Trap:** the design review prep is often quoted as zero by contractors who haven't worked the corridor. The actual cost: 2-4 weeks of submission time plus $1,500-3,000 in architect/draftsperson fees to produce the plan set the board wants. If your bid doesn't have a line item for "design review submittal," that line item is hidden in your post-signing change orders.

**What to do:** before bid review, ask each contractor: "Have you worked the Mountain Road corridor? Show me a project that went through design review." If they hesitate, drop them. Your contractor's familiarity with the local board is worth more than $5,000 on the bid.`,
    },
    {
      h2: 'Heat pump rebates that stack in Stowe',
      body: `Stowe is a VPPSA member utility (Stowe Electric Department). The rebate stack is real but it's not identical to GMP territory.

The headline is the EVT ducted rebate at $2,200 (verified April 2026, paid to the contractor at job completion — net invoice line, not a check you receive). Stack with the EVT $400 fuel-switching bonus if you're removing an oil furnace. Add $500 for a service-panel upgrade if it's required for the install.

**Vermont-specific:** VPPSA-member-utility customers at or below 80% AMI get a $1,000-per-condenser bonus on top of the EVT rebate. That's lower than the $2,000 GMP customers get, but it's still real money. Verify your AMI threshold with the installer when they file the rebate paperwork — we cannot promise eligibility.

**Trap:** the EVT rebate requires a participating contractor and a NEEP-listed cold-climate system. If the contractor isn't on the EVT participating list, the rebate is forfeit. Confirm participation in writing before the deposit clears.`,
    },
    {
      h2: 'When to schedule contractor work',
      body: `Stowe contractors book out further than the statewide median. Realistic windows for 2026:

Mud season (March through mid-May) is dead. Vermont's mud season runs roughly March 1 through May 15 in most of central and northern Vermont, and Stowe sits in the worst of it. Heavy trucks can't reach driveways for ~6 weeks. Most exterior work is impossible. Use the time for interior work, design review submission, and material ordering.

Summer (mid-June through Labor Day) is peak demand. Booking interior renovation in summer means competing with second-home prep work.

Shoulder seasons (April-May, October) are the sweet spot for booking. **Trap:** by the time you're calling in October for a January install, the contractor has already filled their winter schedule. Call by August for fall work, by April for summer work, and by November for spring work after mud season.`,
    },
  ],

  faq: [
    {
      question: 'How much above the Vermont average will I pay for renovations in Stowe?',
      answer: "About 30-40% above statewide median. The premium comes from labor scarcity, Mountain Road design review prep time, and historic district scrutiny. Get three written bids — the cheapest is often a non-Stowe contractor underestimating these specifics.",
    },
    {
      question: 'Can I do an ADU in Stowe?',
      answer: "Probably yes. Vermont's Act 47 (effective July 2024) overrides most town ADU caps, including Stowe's. Stowe's bylaw still controls setbacks, lot coverage, and parking — but the size cap that used to block many ADU projects isn't enforceable. Verify your specific lot with the town zoning office before signing anything.",
    },
    {
      question: 'Is Mountain Road design review applied to interior-only work?',
      answer: 'No. Design review applies to exterior changes visible from a public way. Interior remodels — kitchens, baths, basement finishes — go through standard building permits but skip design review. If you have any exterior component (windows, doors, siding, roofing visible from Mountain Road), design review applies.',
    },
    {
      question: 'How does Stowe Electric (VPPSA) compare to GMP for heat pump rebates?',
      answer: 'Stowe Electric is a VPPSA member utility, so the income-eligible heat pump bonus is $1,000 per condenser instead of GMP\'s $2,000. The EVT statewide rebate ($2,200 ducted, $475 per ductless head) applies the same way regardless of utility.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-electrical-service-upgrade',
    'vppsa-heat-pump-income-bonus',
    'vt-act-47-adu',
    'vt-mud-season-window',
    'vt-tier-resort-premium',
    'vt-cost-heat-pump-ducted',
    'vt-cost-windows-replacement',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-much-does-kitchen-remodel-cost-vermont',
    'how-much-does-roof-replacement-cost-vermont',
    'vermont-renovation-permit-guide',
    'vermont-contractor-red-flags',
  ],

  relatedServiceSlugs: [
    'kitchen-remodeling-stowe-vt',
    'bathroom-remodeling-stowe-vt',
    'roofing-stowe-vt',
    'window-replacement-stowe-vt',
    'deck-builders-stowe-vt',
  ],

  sampleAddress: 'Main Street, Stowe, VT',
  samplePropertySlug: 'main-street-stowe-vt',

  verifyDate: '2026-05-03',
}
