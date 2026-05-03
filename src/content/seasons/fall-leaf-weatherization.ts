import type { SeasonalGuideContent } from '../templates/seasonal-guide-template'

// Fall leaf / weatherization season — Sept 15 through Oct 31.
// EVT funding cycle, contractor schedule transition, the
// last window before frost makes most exterior work
// impractical. The opening hook: federal 25C expired, EVT pot
// runs out before December.

export const FALL_LEAF_WEATHERIZATION_CONTENT: SeasonalGuideContent = {
  slug: 'fall-leaf-weatherization',
  season: 'fall_leaf',
  metaTitle: 'Vermont weatherization season — EVT rebate window, contractor scheduling',
  metaDescription: "Vermont weatherization season is mid-September through October. EVT 75% rebate available year-round but the 2026 pot runs out before December. What works, what to book.",
  h1: "Vermont weatherization season — book in September, not November.",

  leadParagraph: "EVT's 75% weatherization rebate is the headline. The federal Section 25C credit (was 30% up to $1,200) expired December 31, 2025 — not in current law. EVT funding is appropriated annually, and 2026's pot will run out before December. Book contractors in September, not November. The exterior weatherization window in Vermont is short; the rebate window is shorter than you think.",

  sections: [
    {
      h2: "Why fall is the weatherization window",
      body: `Three forces converge in mid-September: ground is firm enough for outdoor work, daytime temperatures are still warm enough for crews to spend hours in attics and crawl spaces, and homeowners are starting to think about heating bills.

The good Vermont weatherization contractors do most of their volume in October. By November, frost makes spray-foam application slower and exterior air-sealing harder. By December, the EVT-network installer pipeline is frozen.

**Vermont-specific:** Vermont's heating degree days run 7,500-8,500 annually, higher than 90% of US states. That math is what makes weatherization payback so fast here. The same air-sealing project that pays back in 8 years in Pennsylvania pays back in 4 years in Vermont. **Worth knowing:** the fall is the demand peak for the EVT-participating contractor pipeline. Contractors who file rebates with EVT regularly (and earn the contractor's bonus) book up by mid-October for season-end work.`,
    },
    {
      h2: 'EVT 75% standard tier — what you actually get',
      body: `EVT's Home Performance with ENERGY STAR program pays 75% of project cost in the standard tier. Cap depends on scope; stacked rebates can total around $7,700.

In practice: a typical $6,000 weatherization project nets $4,500 paid by EVT to the contractor at job completion. Your out-of-pocket: $1,500. The rebate is paid to the contractor — it shows up as a net invoice line, not as a check you receive separately.

**Trap:** the contractor who bids a $4,500 project as "$1,125 after rebate" — implying the homeowner gets a check. The rebate is paid to the contractor, not to you. Confirm in writing whether the bid is "before EVT rebate" or "your net out-of-pocket after rebate." Bids that don't clarify are concealing about $3,000 in EVT money flowing to the contractor.

**Vermont-specific:** EVT's contractor list is at efficiencyvermont.com/find-contractor. If your contractor isn't on the list, the rebate is forfeit. Verify before signing the deposit check.`,
    },
    {
      h2: 'EVT 90% income-eligible tier',
      body: `If your household income is at or below 80% AMI for your county, EVT's income-eligible weatherization tier pays 90% of project cost. Stacked rebates here can total around $16,700.

**Vermont-specific:** Chittenden County's 80% AMI threshold for a 3-person household is around $96,750 (2026 — verify with the contractor at filing time). Most rural counties run 15-25% lower. Many Vermont households qualify for the income-eligible tier and never apply because they assume they make too much. The actual income limit is higher than people guess.

**What to do:** before the contractor bid, look up your county's 80% AMI for your household size at HUD's data tables (huduser.gov). If you're under, mention income-eligibility to the contractor on the first call. The contractor verifies eligibility when filing the rebate paperwork — but they need to know to flag the project that way from the start.

**Trap:** assuming income-eligibility based on a self-employed year with low taxable income but high gross revenue. EVT uses a specific calculation, not just AGI. Don't promise yourself income-eligibility you might not get; the contractor confirms when filing.`,
    },
    {
      h2: 'Federal 25C is expired — what changed',
      body: `Federal Section 25C Energy Efficient Home Improvement Credit was 30% up to $1,200/year on insulation, windows, and doors. It expired December 31, 2025. As of 2026 it is not in current law.

**What this means:** the federal layer that homeowners stacked on top of EVT for 2024-2025 weatherization projects is gone. The total rebate stack is now lower than it was in 2024-2025.

**Trap:** the contractor or online cost calculator that still references the federal 25C credit. Some pages haven't updated. The 2026 stack is EVT 75% (or 90% income-eligible) plus utility-specific layer (small) plus state-specific bonuses (small). The federal piece is no longer in the stack until and unless Congress reinstates it.

**Worth knowing:** the federal Section 25D Residential Clean Energy Credit (30% of solar PV and battery storage costs) is still in effect. That credit applies to solar+battery, not insulation/weatherization. Don't confuse the two — the names are similar, the rules aren't.`,
    },
    {
      h2: "What weatherization actually buys you",
      body: `Vermont weatherization is mostly air-sealing and insulation. The work breaks down roughly:

**Air sealing** — finding and sealing the gaps where heated air escapes. Attic hatches, top plates, plumbing penetrations, electrical outlets in exterior walls. A blower-door test ($150-300) before and after measures effectiveness. Most Vermont homes leak 30-50% of their heated air through gaps that take a contractor 2-3 days to seal.

**Attic insulation** — Vermont's R-value target for attics is R-49 to R-60. Most pre-1990 Vermont homes have R-19 to R-30. Adding cellulose blow-in to bring an old attic to R-49 costs $1,500-3,500 and pays back in 3-5 years on heating bills.

**Wall insulation** — harder. Existing walls without insulation can be dense-packed with cellulose through small access holes. Walls with old fiberglass batts that have settled can be top-dressed with dense-pack. A typical 2,000 sq ft home wall insulation upgrade runs $4,000-9,000.

**Worth knowing:** the EVT energy audit (free if you qualify, $300-500 otherwise) is the diagnostic that tells you what to do, in what order. **Verify with** the auditor about which scope items qualify for the rebate before bid review. Don't assume; the program has specific qualifying-measures lists.`,
    },
    {
      h2: 'Heat pump + weatherization sequencing',
      body: `Sequence matters. Weatherize first, then size the heat pump. A weatherized home needs a smaller, cheaper heat pump system. EVT's program logic explicitly assumes this order — heat pump rebates are larger when paired with prior weatherization.

**Trap:** the homeowner who buys a heat pump first, then weatherizes. The heat pump is now oversized, runs short cycles, costs more to operate, and the contractor can't easily resize. The fix would be replacing the heat pump — losing the original install cost.

**What to do:** if you're considering both heat pump and weatherization, talk to an EVT energy auditor about sequencing. Most paths run: blower-door test → air-seal + insulate → wait 1-2 weeks for the home to settle → re-test → size and install heat pump. The 4-6 week sequence delivers a 15-25% lower heat pump operating cost over the life of the system vs. an unweatherized install.

**Vermont-specific:** EVT bundles the rebates: the EVT $2,200 ducted heat pump rebate stacks with the weatherization 75% rebate, plus the $400 fuel-switching bonus if removing oil. That's a real $7,000-9,000 stack on a typical retrofit. Income-eligible households can hit $15,000-17,000.`,
    },
    {
      h2: 'When the 2026 pot runs out',
      body: `EVT funding is appropriated annually by the Vermont Legislature. The pot runs out before December most years. Once the year's funding is depleted, projects scheduled for the remainder of the year don't get the rebate — or they get a reduced one.

**Vermont-specific:** the program has historically run out of funds in late November or early December. Projects scheduled for January are usually fine (new fiscal year). Projects scheduled for late November-December are riskiest.

**What to do:** if you want a 2026 weatherization project rebate, sign the contract by October 15. The contractor files the rebate paperwork with EVT before starting work; that secures the rebate against the pot. **Verify with** EVT's contractor relations team if you're uncertain about the year's funding status.

**Last action:** by November 1 each year, contact EVT directly to confirm whether 2026 funding is exhausted. If it is, push your project to January 2027 and lock in 2027 funding when the new fiscal year opens.`,
    },
  ],

  faq: [
    {
      question: 'Does the 2025-expired federal 25C credit affect my 2026 weatherization rebate?',
      answer: "Yes — the federal 30% up to $1,200/year stack on top of EVT is gone in 2026. Your stack is now EVT 75% (or 90% income-eligible) plus utility-specific layer plus state bonuses. The federal piece is no longer in the math.",
    },
    {
      question: 'Will the EVT 75% rebate run out in 2026?',
      answer: "Historically, EVT funding has run out in late November or early December most years. Sign your contract by October 15 to maximize the chance the rebate is secured before the pot is depleted. Contractor files rebate paperwork before work starts; that's what locks the rebate against the year's funding.",
    },
    {
      question: 'Do I get the EVT rebate as a check, or is it taken off my invoice?',
      answer: 'Taken off your invoice. EVT pays the rebate directly to the participating contractor at job completion. The rebate shows up as a net invoice line, not as a separate check to you. Confirm with the contractor whether their bid is "before rebate" or "your net out-of-pocket after rebate."',
    },
    {
      question: "How do I qualify for the EVT income-eligible 90% tier?",
      answer: 'Household income at or below 80% AMI for your county and household size. Chittenden County 3-person threshold is around $96,750 (verify with contractor at filing). Most rural counties run 15-25% lower. Mention income-eligibility to the contractor on the first call so they flag the project from the start.',
    },
    {
      question: 'Should I weatherize before installing a heat pump?',
      answer: 'Yes. Weatherized homes need smaller, cheaper heat pumps. EVT explicitly designs the program around this order. Doing heat pump first leaves you with an oversized system that runs short cycles and costs more long-term. Plan for a 4-6 week sequence: blower-door test → seal/insulate → re-test → heat pump install.',
    },
  ],

  factIds: [
    'evt-weatherization-standard-tier',
    'evt-weatherization-income-eligible',
    'evt-diy-weatherization-rebate',
    'evt-ducted-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'federal-25c-expired',
    'federal-25d-clean-energy',
    'vt-heating-degree-days',
    'vt-cost-weatherization-whole-home',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-to-find-contractor-vermont',
    'vermont-renovation-permit-guide',
    'vermont-home-renovation-winter',
    'how-much-does-kitchen-remodel-cost-vermont',
  ],

  relatedTownSlugs: ['burlington-vt', 'montpelier-vt', 'st-johnsbury-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
