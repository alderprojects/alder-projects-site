import type { TownPageContent } from '../templates/town-page-template'

// Woodstock — resort_premium tier. Quechee Lakes (private
// association) layers atop Woodstock zoning. Historic district
// covers most of the village. Wealthy second-home owners drive
// premium pricing on visible-corridor work.

export const WOODSTOCK_CONTENT: TownPageContent = {
  slug: 'woodstock-vt',
  townName: 'Woodstock',
  county: 'Windsor County',
  townTier: 'resort_premium',
  utility: 'Green Mountain Power (GMP)',
  population: 3068,
  medianHomeValue: 680000,

  metaTitle: 'Woodstock, VT property guide — Quechee Lakes rules, historic district, costs',
  metaDescription: "Quechee Lakes association rules layer atop Woodstock zoning. What it actually costs to renovate a Woodstock or Quechee property in 2026 — including the second permit step most homeowners forget.",
  h1: "Woodstock, Vermont — historic district, Quechee Lakes layer, premium pricing.",

  leadParagraph: "Quechee Lakes association rules layer atop Woodstock zoning. Read both before any exterior work. The historic district covers most of the village, and the Quechee Lakes Association has its own architectural review process that runs in parallel to the town. Two permit tracks. Most homeowners only learn about the second one after their builder hits a wall.",

  sections: [
    {
      h2: "The Quechee Lakes Association track",
      body: `Quechee Lakes is a private community within Hartford/Woodstock. Properties inside Quechee Lakes are subject to QLA's architectural review on top of town zoning. That means: any exterior change — roofing material, siding color, deck railings, even mailbox style in some sections — gets reviewed by QLA before town permitting, and the QLA review is design-prescriptive in ways the town isn't.

**Vermont-specific:** if your property is in Quechee Lakes (Quechee Main Street, Marsh Hawk Road, Vista Drive areas), confirm with QLA's architectural review committee before signing any exterior work contract. The review takes 2-4 weeks and may impose specifications (e.g., required cedar shingle colors, prohibited deck railing styles) the contractor's bid didn't anticipate.

**Trap:** the contractor who quotes from a town zoning standpoint without flagging QLA. Cost difference: a $35,000 deck where the contractor specified composite materials becomes $48,000 after QLA mandates cedar with specific stain. Confirm with QLA before bid review.`,
    },
    {
      h2: "Woodstock village historic district",
      body: `The Woodstock Village historic district covers Central Street, the green, and most of the side streets within ~6 blocks of the village center. Any visible exterior change requires design review approval.

**Vermont-specific:** Woodstock's design review is more stringent than Manchester's. The Woodstock Foundation and the village have a long-standing preservation ethic, and the design review board exercises it. Standing-seam metal roofs in colors other than weathered copper or dark gray rarely pass. Vinyl siding doesn't pass. Modern window styles need to match the historic profile.

**Trap:** the buyer who wants to "open up" the kitchen by putting a large window where a small one used to be. If visible from a public way, design review will likely deny it. Plan around the historic profile, not against it.

**Verify with** the village clerk and the design review board's published guidelines before signing.`,
    },
    {
      h2: "Project costs in Woodstock",
      body: `Resort-tier (1.4× statewide median) applies. Specific ranges:

**Kitchen remodel** — $50,000-90,000 mid-range. Premium custom cabinetry from Burlington or Hanover shops adds another 10-20%.

**Bathroom remodel** — $18,000-35,000 mid-range. Older Woodstock homes (1850s-1900s) often have galvanized supply lines and original cast-iron drain stacks that need full replacement during a bath project — add $3,000-7,000.

**Roof replacement** — $14,000-32,000 standing seam metal. **Worth knowing:** standing seam in approved historic-district colors (weathered copper, dark gray, occasionally hunter green) costs about 8-12% more than the standard palette. Budget accordingly.

**Heat pump install** — $14,000-28,000 ducted (resort tier), $5,000-12,000 ductless. EVT ducted rebate $2,200, plus GMP's $2,000-per-condenser bonus if income-eligible. Old farmhouse layouts in Woodstock often need ductwork retrofits which adds $4,000-8,000 to the heat pump bid.

**Heat pump caveat:** historic district doesn't usually scrutinize HVAC indoor units, but exterior condensers need siting plans showing they're not visible from Main Street. Set this up in the design review submittal.`,
    },
    {
      h2: "Working the two permit tracks in parallel",
      body: `If you're inside Quechee Lakes AND in a part of Woodstock where the historic district applies, you've got two separate review processes. They don't talk to each other. You manage both.

**What to do:**

1. **Verify with** QLA architectural review whether your property is in their jurisdiction. Quechee Lakes property owners should have the QLA design guidelines on file already.

2. **Verify with** the village clerk whether your property is inside the Woodstock Village historic district. The boundary is published; look it up before signing.

3. Submit to both reviews early. They run in parallel, not in sequence. Plan on 4-8 weeks total elapsed time before town building permit can be filed.

4. The contractor bid should include a line item for "QLA + historic design review prep." If it doesn't, that's a $2,000-5,000 cost about to surface as a change order.

**Trap:** assuming a contractor experienced with town zoning is also experienced with QLA. Most aren't. QLA's design language is more like a private architectural code than a town bylaw, and the review committee meets monthly — miss the cycle and you wait another four weeks. Confirm the contractor has done at least one QLA project before signing.`,
    },
  ],

  faq: [
    {
      question: 'Is my Woodstock property in the Quechee Lakes Association?',
      answer: 'Properties inside the Quechee Lakes development are. The QLA boundary is roughly Quechee Main Street, Marsh Hawk Road, and the Vista Drive neighborhoods. If you bought into a Quechee Lakes property, you got the architectural guidelines at closing. If you\'re unsure, contact QLA\'s architectural review committee.',
    },
    {
      question: 'Why does the historic district affect my costs?',
      answer: "Approved roofing colors, siding materials, and window profiles cost more than off-the-shelf options. A standing-seam roof in approved historic colors runs 8-12% above standard palette. Vinyl siding usually isn't approvable. Match the historic profile in the design phase to avoid surprise change orders later.",
    },
    {
      question: 'How long does Quechee Lakes architectural review take?',
      answer: '2-4 weeks for most submissions. Bigger projects (additions, ADUs, exterior gut renovations) can run 6-8 weeks. The review is concurrent with town zoning, not sequential, but both must approve before construction can begin.',
    },
    {
      question: 'Are heat pump exterior condensers visible from Main Street allowed in the historic district?',
      answer: 'Usually only if the siting plan shows the unit hidden — behind a fence, in a side yard not visible from the public way, or screened by landscaping. The design review board will scrutinize this. Plan the siting before bid review, not after.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'gmp-heat-pump-income-bonus',
    'vt-tier-resort-premium',
    'vt-cost-heat-pump-ducted',
    'vt-cost-roof-standing-seam',
    'vt-cost-kitchen-mid',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-much-does-kitchen-remodel-cost-vermont',
    'how-much-does-roof-replacement-cost-vermont',
    'vermont-renovation-permit-guide',
    'vermont-contractor-red-flags',
  ],

  relatedServiceSlugs: [],

  sampleAddress: 'Main Street, Woodstock, VT',
  samplePropertySlug: 'main-street-woodstock-vt',

  verifyDate: '2026-05-03',
}
