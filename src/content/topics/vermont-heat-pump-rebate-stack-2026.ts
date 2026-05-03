import type { TopicGuideContent } from '../templates/topic-guide-template'

// Heat pump rebate stack — the highest-rebate path in Vermont.
// $7-17k stacked is real; the order matters more than most
// homeowners realize.

export const HEAT_PUMP_REBATE_STACK_2026_CONTENT: TopicGuideContent = {
  slug: 'vermont-heat-pump-rebate-stack-2026',
  topicId: 'heat_pump',
  metaTitle: "Vermont heat pump rebate stack 2026 — $7-17k real, in the right order",
  metaDescription: "$2,200 EVT ducted is the headline. Stack right and you hit $7-17k off a Vermont heat pump install. Stack wrong and you lose half. The order matters.",
  h1: "Vermont heat pump rebate stack 2026 — get the order right.",

  leadParagraph: "$2,200 is the headline EVT rebate. Stack the right way and you're at $7,000-17,000 in stacked rebates. Stack wrong and you lose half of it. The order matters more than most homeowners realize. EVT pays the contractor, not you. The federal Section 25D credit applies to solar+battery, not heat pumps. The GMP $2,000 income-eligible bonus stacks for GMP customers; the $1,000 VPPSA bonus stacks for VPPSA-utility customers. Burlington Electric (BED) customers don't stack the utility-side bonus.",

  sections: [
    {
      h2: 'The rebates that actually stack',
      body: `As of mid-2026, the Vermont heat pump rebate stack has these moving pieces:

**EVT ducted heat pump rebate** — $2,200. Per system. Paid by EVT to a participating contractor at job completion. Reflected as a net invoice line, not a check you receive.

**EVT ductless heat pump rebate** — $475 per indoor head. Multiple heads stack within program rules. A 3-head system: $1,425 in EVT rebate.

**EVT fuel-switching bonus** — $400. On top of the ducted rebate. Requires removing oil furnace/boiler as primary heat. Documentation of fuel switch required.

**EVT electrical service upgrade** — $500. Tied to electrification. Requires a paired heat pump or EV charger install.

**EVT heat pump water heater** — $600. Stacks with the heat pump install if you do both at once.

**Utility-side bonus (GMP only)** — $2,000 per condenser for income-eligible customers. Households at or below 80% AMI for the county. **Vermont-specific:** Chittenden County 3-person 80% AMI is around $96,750 (2026; verify with installer at filing time). Most rural counties run 15-25% lower.

**Utility-side bonus (VPPSA member utilities)** — $1,000 per condenser for income-eligible customers. VPPSA towns: Hyde Park, Stowe, Northfield, Ludlow, Lyndonville, Hardwick, Morrisville, Enosburg, Swanton, Barton, Jacksonville, Johnson, Orleans, Readsboro.

**Utility-side bonus (Burlington Electric Department)** — does NOT stack the way GMP and VPPSA do. BED has its own narrower incentive layer. **Verify with** your BED account when planning the stack.

**Federal Section 25D Residential Clean Energy Credit** — this is the credit that does NOT stack on heat pumps. 25D applies to solar PV and battery storage. The federal Section 25C (which used to stack on heat pumps for 30% up to $2,000) expired December 31, 2025 and is not in current law.`,
    },
    {
      h2: 'What the stack adds up to',
      body: `Specific stack scenarios for a typical Vermont retrofit (verified April 2026):

**Standard tier, GMP territory, oil-to-electric conversion, single ducted system:**
- $2,200 EVT ducted
- $400 EVT fuel-switching
- $500 EVT electrical service upgrade
- $0 GMP utility bonus (not income-eligible)
- Total: $3,100 against a $14,000-16,000 install. Out-of-pocket: $11,000-13,000.

**Income-eligible tier, GMP territory, oil-to-electric, single ducted:**
- $2,200 EVT ducted
- $400 EVT fuel-switching
- $500 EVT electrical service upgrade
- $2,000 GMP income-eligible bonus
- Total: $5,100. Out-of-pocket: $9,000-11,000.

**Income-eligible tier, VPPSA territory (Stowe, Hyde Park, etc.), oil-to-electric, single ducted:**
- $2,200 EVT ducted + $400 fuel-switching + $500 panel = $3,100
- $1,000 VPPSA income-eligible bonus
- Total: $4,100. Out-of-pocket: $9,500-11,500.

**Standard tier, BED territory (Burlington), oil-to-electric, single ducted:**
- EVT stack: $3,100
- BED-specific incentive: varies (verify with BED for current program)
- Total typically $3,100-3,500.

**Aggressive multi-system, income-eligible, GMP territory:**
- Ducted system in primary house: $2,200 EVT + $400 + $500 + $2,000 GMP = $5,100
- 3-head ductless secondary: $1,425 EVT + $2,000 GMP per condenser
- Heat pump water heater: $600 EVT
- Total: ~$11,500-15,000+ depending on configuration.

**Worth knowing:** the highest-rebate paths are oil-to-electric conversions in income-eligible GMP-territory households. The $400 fuel-switching bonus is meaningful because it's free money the homeowner often forgets to ask about.`,
    },
    {
      h2: 'The order of operations',
      body: `Stacking right requires sequencing. The order:

**Step 1: weatherize first.** EVT explicitly designs the program around this order. A weatherized home needs a smaller, cheaper heat pump system. The sizing math works out 15-25% cheaper. EVT rebates are larger when paired with prior weatherization. **Trap:** the homeowner who buys a heat pump first, then weatherizes. The heat pump is now oversized, runs short cycles, costs more to operate, can't easily be resized.

**Step 2: confirm contractor is EVT-participating.** The EVT rebate requires a participating contractor. List is at efficiencyvermont.com/find-contractor. Non-participating = rebate forfeit. **Verify with** the contractor in writing before deposit.

**Step 3: confirm income-eligibility (if applicable).** Bring household income documentation to the first contractor meeting. The contractor verifies eligibility when filing the rebate paperwork. Skipping this step often means missing the $2,000 GMP bonus by accident.

**Step 4: panel upgrade (if needed).** If the existing electrical service can't handle the heat pump load, schedule the panel upgrade with the heat pump install. The $500 EVT electrical service upgrade rebate requires the upgrade to be tied to electrification. Standalone panel upgrades don't get the rebate.

**Step 5: fuel switch (if applicable).** Removing an oil furnace as primary heat unlocks the $400 fuel-switching bonus. Documentation of fuel switch required.

**Step 6: file paperwork.** Contractor files with EVT before work starts; that's what locks the rebate against the funding pot. Verify the filing has been acknowledged by EVT before the project completes.`,
    },
    {
      h2: 'What costs are real',
      body: `Vermont heat pump install costs as of mid-2026 (verified April 2026):

**Single ducted whole-house** — $11,000-22,000 installed (statewide median). Resort-tier towns reach $14,000-28,000.

**Single-zone ductless mini-split** — $3,500-5,500 installed.

**Multi-zone ductless (2-3 rooms)** — $7,000-12,000 installed.

**Heat pump water heater** — $2,500-4,500 installed (after $600 EVT rebate, net $1,900-3,900).

**Cost drivers** that push toward the high end: old wiring requiring service upgrade ($3,000-7,500), ductwork retrofits in old homes ($4,000-8,000), tight installation locations requiring custom refrigerant line routing ($1,000-3,000), historic-district siting requirements that force unusual condenser placement.

**Trap:** the contractor whose bid quotes the rebated price and pretends it's the install cost. If the bid says "$8,800 installed" but doesn't break out gross install + rebate, you don't know what you're really paying. The bid must show gross install cost, then EVT rebate, then your net out-of-pocket. Demand that breakdown in writing.`,
    },
    {
      h2: 'Vetting a Vermont heat pump installer',
      body: `Specifics that matter beyond general contractor vetting:

**Cold-climate experience.** Ask how many heat pumps they've installed in Vermont winters. NEEP-listed cold-climate systems are required for the EVT rebate; ask which models they typically install and why.

**EVT participation.** Confirm in writing that they're on the EVT participating contractor list and have filed at least 10 rebates in the past year. Long-time participants know the paperwork; new participants sometimes drop the ball.

**Vermont electrical license + AG registration.** All electrical work must be done by a licensed Vermont electrician. The contractor must be registered with the Vermont AG's Consumer Assistance Program for any project $3,500+ (free for contractors; refusing is a red flag).

**Reference checks specific to heat pumps.** Get 3 references from heat pump installs in the past 12 months. Call them. Ask about January performance specifically — did the system run smoothly through the cold snap?

**Trap:** the bid that's $1,500 below the next-lowest bid because the installer skips the panel upgrade or doesn't verify income-eligibility. Cheap heat pump installs that miss the rebates aren't cheap; they're losing the homeowner $2,000-4,000 in unclaimed rebates.`,
    },
    {
      h2: "When in the year to install",
      body: `Vermont heat pump install demand peaks in the fall (September through November). Booking a heat pump install in November for January is unrealistic — the good installers are fully booked through end of year.

**The realistic schedule:**
- Want a heat pump for fall 2026: book by April 2026 with deposit in May.
- Want one for spring 2026: should be booked already; you're in the cancellation queue.
- Want one for the next year (e.g., fall 2027): start the search in February-March 2027.

**Vermont-specific:** the contractor's January workload is mostly emergency calls on systems installed in October that show issues during the first cold snap. New installs aren't booked in January-February for technical reasons (cold weather makes refrigerant work harder) plus capacity reasons.

**What to do:** if you want to maximize the rebate stack and get a strong installer, the play is to call in February-March for the same fall install. That's enough lead time to weatherize first (4-6 weeks), do an EVT energy audit, get bids, sign by April, and have the install completed before the EVT funding pot runs out in late November.`,
    },
  ],

  faq: [
    {
      question: 'Does the federal tax credit still apply to heat pumps in 2026?',
      answer: "No — Section 25C (which provided 30% up to $2,000 on heat pumps) expired December 31, 2025 and is not in current law. Section 25D (Residential Clean Energy Credit) is still in effect at 30%, but applies to solar PV and battery storage, not heat pumps. The 2026 stack is EVT + utility-side bonus only.",
    },
    {
      question: 'What is the income threshold to qualify for the GMP $2,000 bonus?',
      answer: "Household income at or below 80% AMI for your county and household size. Chittenden County 3-person threshold is around $96,750 (2026 — verify at filing time). Most rural counties run 15-25% lower. Many Vermont households qualify and don't apply because they assume they make too much.",
    },
    {
      question: 'Can I install a heat pump myself and still get the EVT rebate?',
      answer: 'No. EVT requires a participating contractor for the heat pump rebate. The Heat Pump Water Heater rebate ($600) does allow self-install with electrician permit, but the main heat pump rebates require contractor installation.',
    },
    {
      question: 'Do BED (Burlington) customers get the same rebates as GMP customers?',
      answer: "EVT statewide rebates ($2,200 ducted, $475 ductless head, $400 fuel-switching) apply equally regardless of utility. The utility-side income bonus is different: GMP $2,000 per condenser, VPPSA $1,000 per condenser, BED has its own narrower program. Verify with your specific utility for current program details.",
    },
    {
      question: 'When should I start planning a heat pump install?',
      answer: '4-6 months before the desired install date. The sequence runs: EVT energy audit → weatherization (4-6 weeks) → heat pump bids → sign + deposit → install. For a fall 2026 install, start in March 2026. For a fall 2027 install, start in March 2027.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-heat-pump-water-heater',
    'evt-electrical-service-upgrade',
    'gmp-heat-pump-income-bonus',
    'vppsa-heat-pump-income-bonus',
    'federal-25c-expired',
    'federal-25d-clean-energy',
    'evt-weatherization-standard-tier',
    'vt-cost-heat-pump-ducted',
    'vt-cost-heat-pump-ductless-single',
    'vt-cost-heat-pump-ductless-multi',
    'vt-contractor-registration-threshold',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-to-find-contractor-vermont',
    'vermont-renovation-permit-guide',
    'how-much-does-kitchen-remodel-cost-vermont',
    'vermont-contractor-red-flags',
  ],

  relatedTownSlugs: ['stowe-vt', 'burlington-vt', 'montpelier-vt', 'st-johnsbury-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
