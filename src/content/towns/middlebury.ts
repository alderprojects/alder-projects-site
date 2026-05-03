import type { TownPageContent } from '../templates/town-page-template'

// Middlebury — small_city tier. Middlebury College drives both
// the rental market and a chunk of the year-round work crew
// pipeline. Student rental conversion rules tightened in 2025.
// Otter Creek runs through downtown — flood implications.

export const MIDDLEBURY_CONTENT: TownPageContent = {
  slug: 'middlebury-vt',
  townName: 'Middlebury',
  county: 'Addison County',
  townTier: 'small_city',
  utility: 'Green Mountain Power (GMP)',
  population: 8496,
  medianHomeValue: 380000,

  metaTitle: 'Middlebury, VT property guide — costs, rental rules, contractor reality',
  metaDescription: "Middlebury College shapes the housing and renovation market. Student rental conversion rules tightened in 2025. What it costs to renovate, build, and maintain a Middlebury property in 2026.",
  h1: "Middlebury, Vermont — college-town housing math.",

  leadParagraph: "College town. Middlebury College's 2,500 students drive the rental conversion market — but the town tightened rental conversion rules in 2025, capping the number of unrelated occupants per unit and adding a registration requirement. If you're buying for rental, the cap math now affects your purchase decision before the renovation budget. Verify with town zoning before signing a contract.",

  sections: [
    {
      h2: "Student rental conversion rules (2025 update)",
      body: `Middlebury's 2025 zoning amendment restricts the number of unrelated occupants in residential properties and adds a rental-property registration requirement. The intent is to slow conversion of single-family homes to high-density student rentals.

**Vermont-specific:** the cap details vary by district — the College Hill area has a stricter cap than the West Middlebury residential streets. **Verify with** the Middlebury planning office for your specific lot before assuming the rental math works.

**Trap:** the buyer who runs financial projections based on 6-occupant rental with the previous owner's permitted use, then discovers the new cap is 4 unrelated occupants per dwelling. The cash flow assumption breaks. Confirm the current allowed occupancy in writing from town zoning before closing on a property where the rental yield is the deal driver.`,
    },
    {
      h2: "Otter Creek floodplain considerations",
      body: `Otter Creek runs through downtown Middlebury. Properties along Court Street, Main Street near the falls, and the East Middlebury area can fall inside the FEMA flood zone or the historical-flood corridor.

**Vermont-specific:** Middlebury hasn't seen a Montpelier-scale flood in recent decades but the Otter Creek 100-year floodplain is mapped, and lenders treat properties inside it accordingly. Get an elevation certificate ($300-600) for any property where the lender flagged a flood-zone concern.

**Trap:** the renovation that pushes a flood-zone Middlebury property over the 50% substantial improvement threshold (cost vs. building's pre-improvement market value). Crossing it forces the entire structure to comply with current floodplain regs — typically raising it. A $40,000 kitchen remodel on a $75,000-assessed-value old farmhouse triggers the rule. Phase the work or know what you're walking into.`,
    },
    {
      h2: "Project costs in Middlebury",
      body: `Middlebury runs at statewide median for the small_city tier. As of mid-2026:

**Kitchen remodel** — $35,000-65,000 mid-range, $60,000-95,000 full gut. **Bathroom remodel** — $12,000-25,000 mid-range.

**Heat pump install** — $11,000-22,000 ducted, $3,500-5,500 single-zone ductless. EVT ducted rebate $2,200; Middlebury is in GMP territory so the income-eligible bonus is $2,000 per condenser. Stack with $400 EVT fuel-switching bonus if removing oil.

**Whole-home weatherization** — $4,000-18,000 typical. Middlebury's pre-1940 housing stock makes weatherization payback fast. EVT 75% rebate (standard tier) brings out-of-pocket to $1,000-4,500.

**Roof replacement** — $8,000-20,000 asphalt, $20,000-35,000 standing seam metal.

**Worth knowing:** Middlebury College drives a strong contractor pipeline — many year-round Addison County crews learned trades on college maintenance work. Quality is generally available; the constraint is often scheduling around the college's summer maintenance push (June-August), when many of the better crews are on campus contracts.

**Trap:** booking a Middlebury contractor for a summer-2026 project in March-April. The good crews already locked their summer schedule with college contracts in February. By the time you're calling in spring, you're shopping the also-rans. Book by November-December for the following summer.`,
    },
    {
      h2: "ADU paths under Act 47",
      body: `Vermont Act 47 (effective July 2024) makes ADUs by-right statewide. In Middlebury, this overrides the town's prior cap. Setbacks, lot coverage, and parking still apply.

**Vermont-specific:** Middlebury's interaction between Act 47 (statewide ADU-by-right) and the 2025 student-rental conversion rules is worth confirming with the planning office. An ADU rented to two unrelated occupants is a different regulatory question than an ADU rented to a single tenant or used as owner-occupied family space. The intersection isn't fully clear in the bylaws as drafted.

**Verify with** the Middlebury planning office before designing an ADU intended for student rental.`,
    },
  ],

  faq: [
    {
      question: "What is the new Middlebury rental cap?",
      answer: "Middlebury tightened rental conversion rules in 2025, capping unrelated occupants per dwelling and adding a registration requirement. The exact cap varies by district — College Hill area is stricter than West Middlebury. Verify with the Middlebury planning office for your specific lot.",
    },
    {
      question: "Can I still build a high-density rental conversion in Middlebury?",
      answer: "Probably not at the densities permitted before 2025. The new cap typically lands at 3-4 unrelated occupants per dwelling. If your purchase math depended on 6+ occupants, the math no longer works. Talk to town zoning before signing a purchase contract.",
    },
    {
      question: "Are there flood-zone constraints near Otter Creek in Middlebury?",
      answer: "Yes — properties along Court Street, near the falls downtown, and East Middlebury can fall inside FEMA flood zones or the 100-year floodplain. Get an elevation certificate before bidding renovation in flagged areas. The 50% substantial improvement rule applies.",
    },
    {
      question: "When do Middlebury contractors book up?",
      answer: "Summer (June-August) is heavy because the college runs its main maintenance push then, pulling crews onto campus contracts. Spring and fall are typically more available. Avoid summer if your project needs the strongest available crew.",
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-weatherization-standard-tier',
    'gmp-heat-pump-income-bonus',
    'vt-act-47-adu',
    'vt-cost-heat-pump-ducted',
    'vt-cost-elevation-cert',
    'vt-cost-weatherization-whole-home',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'vermont-flood-zone-renovation',
    'vermont-renovation-permit-guide',
    'how-much-does-kitchen-remodel-cost-vermont',
    'how-to-find-contractor-vermont',
  ],

  relatedServiceSlugs: [
    'kitchen-remodeling-middlebury-vt',
    'bathroom-remodeling-middlebury-vt',
    'roofing-middlebury-vt',
    'deck-builders-middlebury-vt',
  ],

  sampleAddress: 'Main Street, Middlebury, VT',
  samplePropertySlug: 'main-street-middlebury-vt',

  verifyDate: '2026-05-03',
}
