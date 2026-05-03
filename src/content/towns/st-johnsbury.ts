import type { TownPageContent } from '../templates/town-page-template'

// St. Johnsbury — rural tier. Northeast Kingdom (NEK). Some of
// Vermont's lowest property prices but limited contractor density.
// Heavy Caledonia County labor rates. Long drives for material
// delivery from Burlington-area suppliers.

export const ST_JOHNSBURY_CONTENT: TownPageContent = {
  slug: 'st-johnsbury-vt',
  townName: 'St. Johnsbury',
  county: 'Caledonia County',
  townTier: 'rural',
  utility: 'Lyndonville Electric (LED) / VPPSA member utility',
  population: 7376,
  medianHomeValue: 215000,

  metaTitle: 'St. Johnsbury, VT property guide — NEK costs, rural reality, rebates',
  metaDescription: "Northeast Kingdom. Lower prices, fewer contractors, longer wait times. What it actually costs to renovate, build, and maintain a St. Johnsbury property in 2026.",
  h1: "St. Johnsbury, Vermont — NEK pricing, NEK contractor density.",

  leadParagraph: "Northeast Kingdom. Some of Vermont's lowest property prices, but limited contractor density. The trade is real: you save on labor and material rates relative to Chittenden County, and you pay for it in scheduling lead time and a smaller bidder pool. Plan farther out than you would for a Burlington or Stowe project. **Verify with** the contractor whether they typically work in St. J or are driving an hour-plus from elsewhere.",

  sections: [
    {
      h2: "Why NEK contractor density matters",
      body: `Caledonia County and the surrounding NEK counties (Orleans, Essex) have lower contractor density than southern or central Vermont. The good crews work mostly within 30-45 minutes of their home base, so St. Johnsbury homeowners draw from a smaller pool than Stowe, Burlington, or Montpelier homeowners do.

**Trap:** the contractor who lives in Lyndonville or Newport but commutes to Stowe and Burlington jobs because the resort markets pay more. They might bid your St. J project at Stowe rates because they're using Stowe-tier scheduling and Stowe-tier overhead assumptions. Ask directly: "Where are most of your jobs?" If they say "Burlington and Stowe," they're probably not the right bid for a St. Johnsbury project.

**What to do:** start the search 4-6 months before you want work to begin. Ask the town clerk about contractors who pulled permits in St. Johnsbury recently. The town's permit log is public and is a better filter than online reviews.`,
    },
    {
      h2: "Material delivery and the Burlington supply lag",
      body: `Most lumber, fixture, and appliance suppliers in Vermont are concentrated in the Burlington area (Lowes, Curtis Lumber, the wholesale plumbing/electric supply chain). Delivery to St. Johnsbury runs an extra day or two and costs more.

**Worth knowing:** for a typical kitchen remodel, the supply-side lag adds $300-800 in delivery fees over a Chittenden County project, and the special-order lead times run 1-2 weeks longer.

**Trap:** the contractor who promises an 8-week kitchen turnaround that assumes Burlington-speed material delivery. Realistic St. Johnsbury kitchen turnaround is 10-14 weeks for the same scope of work, mostly because the trim package or the cabinets are sitting in a Williston warehouse waiting for the next NEK delivery truck.`,
    },
    {
      h2: "Project costs in St. Johnsbury",
      body: `St. Johnsbury runs at the rural tier (about 0.85× statewide median for most categories). As of mid-2026:

**Kitchen remodel** — $28,000-55,000 mid-range, $50,000-85,000 full gut. Lower than the small-city tier.

**Bathroom remodel** — $10,000-22,000 mid-range.

**Heat pump install** — $9,500-19,000 ducted, $3,000-5,000 single-zone ductless. EVT $2,200 ducted rebate applies. **Vermont-specific:** St. Johnsbury is on Lyndonville Electric (LED), a VPPSA member utility. The income-eligible bonus is $1,000 per condenser (vs. $2,000 in GMP territory). The $400 EVT fuel-switching bonus is the biggest stacker for NEK homeowners with old oil furnaces — and oil-to-electric conversion is the most common heat-pump path in the NEK.

**Whole-home weatherization** — $3,500-15,000 typical. **Worth knowing:** NEK weatherization is some of the highest-payback work in Vermont because of the older housing stock and longer heating season. EVT 75% rebate brings out-of-pocket to $875-3,750.

**Roof replacement** — $7,000-17,000 asphalt, $17,000-30,000 standing seam metal.`,
    },
    {
      h2: "Mud season is worse here",
      body: `St. Johnsbury and the NEK have the longest mud season in Vermont. Roughly mid-March through late May in normal years, sometimes into early June at higher elevations. Class 4 dirt roads (which a lot of NEK properties are on) are effectively unreachable for 6-8 weeks.

**Vermont-specific:** many NEK towns post weight limits earlier than the rest of the state — sometimes by mid-March. Once posted, oil delivery and contractor trucks can't reach posted-road properties until weight limits lift.

**Trap:** the spring renovation kickoff that assumes work can start April 1. In the NEK, exterior work rarely starts before mid-May at the earliest, and Class-4-road properties might not see a heavy truck until early June. Plan accordingly.

**What to do:** if you're on a Class 4 road, schedule heavy material deliveries (lumber, gravel, septic install) for early November before frost or for late June after the ground firms. Don't fight mud season; plan around it.`,
    },
  ],

  faq: [
    {
      question: 'Why is the contractor pool smaller in St. Johnsbury than in central Vermont?',
      answer: "NEK has lower contractor density than southern or central Vermont. The good crews work within 30-45 minutes of their home base, and many drift toward Stowe and Burlington jobs because resort markets pay more. Start the search 4-6 months out and use the town's permit log to identify contractors actually working in St. Johnsbury.",
    },
    {
      question: 'Are heat pump rebates lower in St. Johnsbury than in GMP territory?',
      answer: 'The EVT statewide rebates apply equally — $2,200 ducted, $475 per ductless head, $400 fuel-switching, $600 heat pump water heater. The utility-specific income bonus is lower: $1,000 per condenser through Lyndonville Electric (VPPSA), vs. $2,000 in GMP territory. Still real money, but smaller than what Burlington-area homeowners get.',
    },
    {
      question: 'How long does mud season really last in the Northeast Kingdom?',
      answer: "Roughly mid-March through late May, sometimes early June at higher elevations or after heavy snow years. Many NEK towns post weight limits by mid-March, blocking oil delivery and heavy contractor trucks. Class 4 road properties may be unreachable for 6-8 weeks.",
    },
    {
      question: "What's the cost difference between renovating in St. Johnsbury vs. Burlington?",
      answer: 'St. Johnsbury runs about 15-20% lower on most renovation categories at the labor and material level. The trade-offs: smaller bidder pool, longer scheduling lead time, and 1-2 weeks of additional supply lag for special-order materials shipped from Burlington-area distributors.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-weatherization-standard-tier',
    'vppsa-heat-pump-income-bonus',
    'vt-mud-season-window',
    'vt-tier-rural-discount',
    'vt-cost-heat-pump-ducted',
    'vt-cost-roof-asphalt',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-to-find-contractor-vermont',
    'vermont-renovation-permit-guide',
    'how-much-does-kitchen-remodel-cost-vermont',
    'how-much-does-roof-replacement-cost-vermont',
  ],

  relatedServiceSlugs: [],

  sampleAddress: 'Main Street, St. Johnsbury, VT',
  samplePropertySlug: 'main-street-st-johnsbury-vt',

  verifyDate: '2026-05-03',
}
