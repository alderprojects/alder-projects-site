import type { TopicGuideContent } from '../templates/topic-guide-template'

// Rebate stack overview — the umbrella guide that ties together
// every rebate path. Heat pump, weatherization, solar+battery,
// federal credits, utility-side adders.

export const VERMONT_REBATE_STACK_2026_CONTENT: TopicGuideContent = {
  slug: 'vermont-rebate-stack-2026',
  topicId: 'rebate_strat',
  metaTitle: 'Vermont rebate stack 2026 — $7-17k that most homeowners leave on the table',
  metaDescription: "Vermont stacks more home-improvement rebates than any other state. Federal, EVT, utility, state. The 2026 stack at standard tier hits $7-9k real money for a comprehensive retrofit. Income-eligible $15-17k.",
  h1: "Vermont rebate stack 2026 — $7-17k real, in the right combination.",

  leadParagraph: "Vermont stacks more home-improvement rebates than any other state. Federal, EVT, town utility (BED, GMP, VPPSA), state programs. The 2026 stack at standard tier hits $7,000-9,000 in real money for a comprehensive retrofit. Income-qualified hits $15,000-17,000. Most VT homeowners leave money on the table because they don't know what stacks with what — or because their contractor isn't on the right participating lists. The federal Section 25C credit (heat pumps + weatherization, 30% up to $1,200) expired Dec 31, 2025; the 2026 math is leaner than 2024-2025 but still strong.",

  sections: [
    {
      h2: 'The four layers of the Vermont stack',
      body: `Vermont's rebate stack has four distinct layers. Most projects use 2-3 of them; the strongest projects use all four.

**Layer 1: Federal credits.** Section 25D (Residential Clean Energy Credit) at 30% of total system cost is the only federal layer still active in 2026 for residential energy work. Applies to solar PV and battery storage. No cap. Rolls forward if exceeds tax liability. Section 25C (heat pumps, weatherization) expired Dec 31, 2025 — not in current law.

**Layer 2: EVT (Efficiency Vermont) statewide rebates.** $2,200 ducted heat pump, $475 per ductless head, $400 fuel-switching bonus, $500 electrical service upgrade, $600 heat pump water heater. Weatherization: 75% of project cost (standard tier) or 90% (income-eligible). Solar+storage: $0.40/Wh of battery capacity. EVT rebates are paid through participating contractors at job completion.

**Layer 3: Utility-side bonuses.** GMP (Green Mountain Power) pays $2,000 per condenser income-eligible bonus on heat pumps. VPPSA member utilities (Stowe, Hyde Park, Lyndonville, etc.) pay $1,000 per condenser income-eligible bonus. BED (Burlington Electric Department) has its own narrower incentive program. Each utility's program shifts annually — verify current rules.

**Layer 4: State programs.** Vermont Net Metering Group 2 ($0.03/kWh adder for in-state solar). State property tax credits (HI-144) for income-qualifying households. Vermont Homestead Declaration (HS-122) for primary-residence tax classification.

**Vermont-specific:** the layers don't always stack cleanly. Some are mutually exclusive, some require sequence. The right contractor knows the combination for your specific situation; the wrong one quotes a rebate stack that includes layers you can't actually claim.`,
    },
    {
      h2: 'What stacks for a typical retrofit',
      body: `Specific stack scenarios for a comprehensive 2026 retrofit (verified April 2026):

**Scenario A: standard tier, GMP territory, oil-to-electric heat pump + weatherization.**
- EVT ducted heat pump: $2,200
- EVT fuel-switching bonus: $400
- EVT electrical service upgrade: $500
- EVT weatherization 75%: ~$3,500-5,500 (on $5,000-7,500 project scope)
- GMP utility bonus: $0 (not income-eligible)
- Federal 25C: $0 (expired)
- Total stack: $6,600-8,600. Out-of-pocket on a $20,000-22,000 combined project: $11,400-15,400.

**Scenario B: income-eligible tier, GMP territory, full retrofit.**
- EVT ducted heat pump: $2,200
- EVT fuel-switching bonus: $400
- EVT electrical service upgrade: $500
- EVT weatherization 90%: ~$5,400-9,000 (on income-eligible tier)
- GMP $2,000/condenser income-eligible bonus: $2,000
- EVT heat pump water heater: $600
- Total stack: $11,100-14,700. Out-of-pocket on $20,000-25,000 combined project: $5,300-13,900.

**Scenario C: standard tier, GMP territory, solar + battery + heat pump.**
- Federal 25D 30% solar + battery: $15,000 (on $50,000 install)
- EVT solar+storage: $5,400 (Powerwall, 13.5 kWh)
- EVT ducted heat pump: $2,200
- EVT fuel-switching: $400
- EVT electrical service upgrade: $500
- Vermont Net Metering Group 2 adder over 25 years: ~$7,125
- Total stack on a $65,000 combined project: $30,625 over the system lifetime; $23,500 in upfront cash credits.

**Worth knowing:** the highest-value stack combinations always include weatherization done before heat pump. Sequence is the multiplier; doing them in the wrong order leaves money on the table.`,
    },
    {
      h2: 'What does NOT stack',
      body: `Common mistakes about what stacks with what:

**Federal 25C is gone.** It was 30% up to $1,200/year on insulation, windows, doors, and 30% up to $2,000 on heat pumps. Expired Dec 31, 2025. Not in current law as of 2026. Online calculators that still reference 25C are out of date.

**Federal 25D doesn't apply to heat pumps or weatherization.** 25D is solar PV and battery storage only. Don't confuse with the expired 25C — the names are similar, the rules aren't.

**BED (Burlington) customers don't stack the GMP bonus.** Each utility has its own program. The $2,000 per condenser bonus is GMP-specific. BED's program is narrower and structured differently.

**Standard tier and income-eligible tier are mutually exclusive.** You qualify for one or the other, not both. The income-eligible tier pays more but requires verification of household income at or below 80% AMI.

**Trap:** the contractor's bid that lists a $4,500 rebate including federal 25C "and federal credit." The federal credit is gone. The bid is using stale 2024-2025 numbers. Reject bids that quote expired federal credits as part of the rebate stack.

**What to do:** before signing, ask the contractor to break out each rebate by name (EVT ducted, EVT fuel-switching, GMP $2,000 income-eligible, etc.) and confirm in writing which ones apply to your specific situation.`,
    },
    {
      h2: 'Income-eligible — the path many homeowners miss',
      body: `Many Vermont households qualify for income-eligible tier rebates and never apply because they assume they make too much.

**Vermont-specific:** Chittenden County's 80% AMI threshold for a 3-person household is around $96,750 (2026 — verify with installer at filing). For a 4-person household, around $107,400. Most rural counties run 15-25% lower. The actual income limit is higher than people guess.

**What changes at income-eligible tier:**
- EVT weatherization: 90% paid (vs 75% standard)
- GMP heat pump bonus: $2,000 per condenser (vs $0 standard)
- VPPSA heat pump bonus: $1,000 per condenser (vs $0 standard)
- Standard tier total stack: typically $4,500-7,500
- Income-eligible total stack: typically $9,500-14,500

**Trap:** assuming income-eligibility based on a self-employed year with low taxable income but high gross revenue. EVT uses a specific calculation, not just AGI. The contractor confirms eligibility when filing — but you need to know to flag the project as income-eligible from the start.

**What to do:** before contractor bids, look up your county's 80% AMI for your household size at HUD's data tables (huduser.gov). If you're under, mention income-eligibility to every contractor on the first call. The contractor verifies eligibility when filing the rebate paperwork.`,
    },
    {
      h2: 'Sequencing the rebate paperwork',
      body: `The order in which the rebate paperwork is filed determines whether the stack works.

**Step 1: contractor confirms participating status.** EVT, GMP, BED, VPPSA each have their own contractor lists. Confirm in writing which lists your contractor is on at bid review.

**Step 2: contractor files rebate paperwork before work starts.** This is what locks the rebate against the funding pot. Without this filing, the rebate is at risk if EVT runs out of 2026 money in November.

**Step 3: EVT acknowledges filing.** The acknowledgment from EVT is what secures the rebate to the project. **Verify with** the contractor that the acknowledgment has been received before work begins.

**Step 4: contractor files utility-side rebate (GMP, VPPSA, BED).** Often filed in parallel with EVT, sometimes after EVT acknowledgment.

**Step 5: project completes; rebates paid to contractor.** Reflected as net invoice line on the homeowner's bill.

**Step 6: federal credits filed by homeowner on annual tax return.** IRS Form 5695 for Section 25D solar + battery. File with the year's tax return.

**Trap:** the homeowner who assumes the contractor will "handle the paperwork" without verifying. Some contractors batch rebate filings and submit at year-end. If the year-end submission is December 28 and the EVT funding pot ran out December 1, you may not get the rebate. Get written confirmation that the paperwork has been submitted and acknowledged, in writing, before work begins.`,
    },
    {
      h2: 'When EVT funding runs out',
      body: `EVT's annual funding pot is appropriated by the Vermont Legislature. The pot historically runs out in late November or early December most years. Once depleted, projects scheduled for the remainder of the year don't get the rebate, or get a reduced one.

**Vermont-specific:** the rebate is locked when the contractor files paperwork with EVT before work starts. Filing late in the year is risky — late November filings may or may not secure the rebate against the depleting pot.

**What to do:**
- For 2026 EVT rebates: sign contracts by October 15, paperwork filed by mid-October, work completed by end of November.
- For 2027 EVT rebates: sign contracts in January-March 2027 when the new fiscal year opens.
- November-December is the riskiest filing window.

**Worth knowing:** the federal credits don't have an annual cap or pot-runs-out risk. Section 25D for solar + battery is available until the credit changes. The risk is EVT-specific.

**Verify with** EVT directly if you're uncertain about current funding status. EVT's contractor relations team can confirm whether 2026 funds are available.`,
    },
  ],

  faq: [
    {
      question: 'Is the federal 25C tax credit still available in 2026?',
      answer: 'No — Section 25C (which covered heat pumps, insulation, windows, doors at 30% up to $1,200-2,000) expired December 31, 2025 and is not in current law. Section 25D (Residential Clean Energy Credit, 30% on solar + battery) is still in effect. Don\'t confuse the two.',
    },
    {
      question: 'How much can I stack on a Vermont retrofit in 2026?',
      answer: 'Standard tier comprehensive retrofit (heat pump + weatherization + electrical upgrade in GMP territory): $6,600-8,600. Income-eligible tier same scope: $11,100-14,700. Add solar + battery: another $20,000-23,000 in upfront credits. The numbers vary by territory (BED, GMP, VPPSA each different).',
    },
    {
      question: 'How do I know if I qualify for the income-eligible tier?',
      answer: 'Household income at or below 80% AMI for your county and household size. Chittenden County 3-person threshold is around $96,750 in 2026. Most rural counties run 15-25% lower. Look up at HUD\'s data tables (huduser.gov) before assuming standard tier. Many Vermont households qualify and never apply.',
    },
    {
      question: 'Why does my BED-territory neighbor get a smaller rebate stack than my GMP neighbor?',
      answer: 'BED (Burlington Electric Department) has its own incentive program separate from GMP\'s. The $2,000 per condenser income-eligible bonus from GMP doesn\'t apply in BED territory. EVT statewide rebates apply equally regardless of utility — but the utility-side layer differs. Verify with your specific utility.',
    },
    {
      question: 'When should I sign rebate-eligible project contracts in 2026?',
      answer: 'By October 15 to maximize the chance the EVT rebate is secured before the annual funding pot is depleted. The contractor files paperwork before work starts; the EVT acknowledgment locks the rebate to the project. Late-November filings are risky.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-electrical-service-upgrade',
    'evt-heat-pump-water-heater',
    'evt-weatherization-standard-tier',
    'evt-weatherization-income-eligible',
    'evt-solar-storage-incentive',
    'gmp-heat-pump-income-bonus',
    'vppsa-heat-pump-income-bonus',
    'federal-25c-expired',
    'federal-25d-clean-energy',
    'vt-net-metering-group2',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-to-find-contractor-vermont',
    'vermont-renovation-permit-guide',
    'vermont-contractor-red-flags',
    'how-much-does-kitchen-remodel-cost-vermont',
  ],

  relatedTownSlugs: ['burlington-vt', 'montpelier-vt', 'stowe-vt', 'st-johnsbury-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
