import type { TownPageContent } from '../templates/town-page-template'

// Vergennes — small_city tier. Vermont's smallest city — 2,500
// people, 2.7 square miles. Contractor density is the constraint.
// Most homes built 1860-1920. Lake Champlain proximity (Otter
// Creek tidal influence) brings shoreland buffer concerns.

export const VERGENNES_CONTENT: TownPageContent = {
  slug: 'vergennes-vt',
  townName: 'Vergennes',
  county: 'Addison County',
  townTier: 'small_city',
  utility: 'Green Mountain Power (GMP)',
  population: 2553,
  medianHomeValue: 320000,

  metaTitle: 'Vergennes, VT property guide — costs, contractor reality, lake setbacks',
  metaDescription: "Vermont's smallest city. Contractor density is the cost driver, not labor rates. What it actually costs to renovate, build, and maintain a Vergennes property in 2026.",
  h1: "Vergennes, Vermont — small city, narrow contractor pool, lake setbacks.",

  leadParagraph: "Vermont's smallest city — 2,500 people, 2.7 square miles. The cost driver here isn't labor rate; it's contractor density. The good Addison County contractors are booked by Middlebury and Bristol second-home owners by mid-spring. If you call in May for a summer project, you're shopping for whoever has open weeks, not whoever's best.",

  sections: [
    {
      h2: 'The contractor density problem',
      body: `Vergennes sits in a contractor-scarce belt. Addison County has fewer per-capita licensed residential contractors than Chittenden or Lamoille counties, and the better ones get pulled north for Burlington-metro work or south for Middlebury College-area renovations.

**Trap:** the homeowner who treats Vergennes pricing like Burlington pricing and assumes 5-6 bids will compete. In practice you might see 2-3 serious bids, and one of them will be a contractor with no openings until next year. The contractor isn't bidding to win; they're holding a slot in case something falls through.

**What to do:** start the contractor search 4-5 months before you want work to begin, not 4-5 weeks. Ask the town clerk who has worked recently on permitted projects. The town's permit log is a public record and a better contractor reference than online reviews.`,
    },
    {
      h2: 'Otter Creek and the shoreland buffer',
      body: `Vergennes was built around the falls on Otter Creek. The downtown is dense and historic; the residential streets fan out toward Otter Creek and Lake Champlain. Properties along the creek and within 250 feet of Lake Champlain are inside Vermont's Shoreland Protection Act buffer.

**Vermont-specific:** Otter Creek's tidal-influenced section near the lake means some residential lots that look "creekside" are actually within the 250-foot lake buffer because of where the high-water mark falls during spring melt and Lake Champlain's seasonal levels. The buffer isn't measured from a fixed line.

**Trap:** the deck or detached garage on the back lot that you assume is outside the buffer because the lake isn't visible. The DEC measures from the high-water mark, not from line-of-sight. A 12-foot variance can be the difference between a 2-week building permit and a 4-month state shoreland permit.

**Verify with** the Vermont ANR Atlas (run your parcel) and the town zoning office before any addition or detached structure within 300 feet of Otter Creek or any creek-side lot.`,
    },
    {
      h2: 'Project costs in Vergennes',
      body: `Vergennes runs roughly at statewide median — neither the resort premium nor the Burlington metro markup applies, but the rural discount doesn't either. The small-city tier means median labor rates and material costs.

**Kitchen remodel** — $35,000-65,000 mid-range, $60,000-95,000 full gut. Lower than Burlington, lower than Stowe.

**Bathroom remodel** — $12,000-25,000 mid-range.

**Roof replacement** — $8,000-20,000 asphalt, $20,000-35,000 standing seam metal. **Worth knowing:** Vergennes contractors are accustomed to handling century-old slate roofs that you don't see in newer Vermont towns. Slate replacement runs $40,000-80,000 and not every Addison County roofer has done one. Get a slate-experienced bid if your house has a slate roof.

**Heat pump install** — $11,000-22,000 ducted, $3,500-5,500 single-zone ductless. Vergennes is in GMP territory, so the income-eligible bonus is $2,000 per condenser, on top of the $2,200 EVT ducted rebate.`,
    },
    {
      h2: "ADU and addition path under Act 47",
      body: `Vergennes' lot sizes vary widely — downtown lots are small, the residential edges have larger parcels. Vermont's Act 47 (in effect since July 2024) makes ADUs by-right statewide, overriding the city's prior 800 sq ft ADU cap.

**What that means in practice:** the ADU you couldn't build under the city's old bylaws — too big, too close to the property line — may now be permittable. The city can still regulate setbacks, lot coverage, and parking. Talk to the city zoning office about the specific lot before designing.

**Trap:** the homeowner who assumes Act 47 makes everything permittable. Setbacks and septic capacity still apply. A 1,200 sq ft ADU on a small lot served by a 3-bedroom septic system requires a septic upgrade ($15,000-30,000 conventional, $30,000-45,000 engineered) before the ADU permit goes anywhere.`,
    },
  ],

  faq: [
    {
      question: 'Why are bids in Vergennes harder to come by than in Burlington?',
      answer: "Addison County has fewer per-capita licensed contractors than Chittenden County, and the strong ones get pulled toward Middlebury and Burlington-metro work. Start your search 4-5 months out, not 4-5 weeks. The town's permit log is a public reference for who's working locally.",
    },
    {
      question: 'Do I need a Vermont shoreland permit if I am near Otter Creek but not the lake?',
      answer: "Maybe. Otter Creek's tidal-influenced section near Lake Champlain means some lots that look creekside are actually inside the 250-foot lake buffer. Run your parcel through the Vermont ANR Atlas before bidding any addition.",
    },
    {
      question: "Can I add an ADU on my Vergennes lot under Vermont's Act 47?",
      answer: "Probably yes. Act 47 (July 2024) overrides Vergennes's prior 800 sq ft ADU cap. The city can still regulate setbacks, lot coverage, and parking. Septic capacity is the binding constraint on most older lots — a 3-bedroom septic can't carry an ADU without an upgrade.",
    },
    {
      question: 'How much does a slate roof replacement cost in Vergennes?',
      answer: "$40,000-80,000 typical. Many century-old Vergennes homes still have slate. Not every Addison County roofer has experience replacing slate, so get a slate-specific bid. Standing seam metal can be matched to historic profile and runs $20,000-35,000 if slate replacement isn't viable.",
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'gmp-heat-pump-income-bonus',
    'vt-act-47-adu',
    'vt-shoreland-buffer',
    'vt-cost-roof-asphalt',
    'vt-cost-roof-standing-seam',
    'vt-cost-septic-conventional',
    'vt-cost-septic-engineered',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'vermont-septic-what-to-know',
    'vermont-renovation-permit-guide',
    'how-to-find-contractor-vermont',
    'vermont-flood-zone-renovation',
  ],

  relatedServiceSlugs: [],

  sampleAddress: 'Main Street, Vergennes, VT',
  samplePropertySlug: 'main-street-vergennes-vt',

  verifyDate: '2026-05-03',
}
