import type { TopicGuideContent } from '../templates/topic-guide-template'

// Weatherization deep guide. EVT 75% / 90% tiers. The
// contractor-paid mechanic that catches homeowners off guard.

export const VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT: TopicGuideContent = {
  slug: 'vermont-weatherization-evt-rebate',
  topicId: 'weatherization',
  metaTitle: 'Vermont weatherization EVT rebate — 75% standard, 90% income-eligible',
  metaDescription: "EVT pays 75% of weatherization project cost in the standard tier, 90% income-eligible. Paid to the contractor, not to you. What stacks, what doesn't, who actually qualifies.",
  h1: "Vermont weatherization rebates — 75-90% real, paid to the contractor.",

  leadParagraph: "EVT pays 75% of weatherization project cost in the standard tier, 90% in the income-qualified tier. The catch: the rebate is paid to the EVT-network contractor, not to you. Pick the wrong contractor and you forfeit the whole thing. The federal Section 25C credit (which used to stack 30% up to $1,200/year) expired December 31, 2025 — so the 2026 math is leaner than the 2024-2025 stack but still the strongest single-project rebate in Vermont.",

  sections: [
    {
      h2: 'What weatherization actually means in Vermont',
      body: `Vermont weatherization is mostly air sealing and insulation. Specific scope items that EVT's Home Performance with ENERGY STAR program funds:

**Air sealing** — finding and sealing the gaps where heated air escapes. Attic hatches, top plates, plumbing penetrations, electrical outlets in exterior walls, rim joists. A blower-door test before and after measures effectiveness. Most pre-1990 Vermont homes leak 30-50% of heated air through gaps that take a contractor 2-3 days to seal.

**Attic insulation** — Vermont's R-value target for attics is R-49 to R-60. Most pre-1990 homes have R-19 to R-30. Adding cellulose blow-in to bring an old attic to R-49 costs $1,500-3,500.

**Wall insulation** — dense-pack cellulose through small access holes for walls without insulation, or top-dressing for walls with settled fiberglass. A typical 2,000 sq ft home wall insulation upgrade runs $4,000-9,000.

**Basement / crawlspace** — rim joist sealing, basement wall insulation, crawlspace encapsulation. Often the highest-value scope item per dollar in Vermont's older housing stock.

**Vermont-specific:** Vermont's 7,500-8,500 annual heating degree days makes the math run faster than 90% of US states. The same air-sealing project that pays back in 8 years in Pennsylvania pays back in 4 years in Vermont. **Worth knowing:** the EVT energy audit is the diagnostic that tells you what scope to do in what order. Free if you qualify, $300-500 otherwise.`,
    },
    {
      h2: 'How the 75% / 90% tiers actually work',
      body: `The standard tier pays 75% of project cost. Cap depends on scope; stacked rebates can total around $7,700.

The income-eligible tier pays 90% of project cost. Stacked rebates here can total around $16,700.

**Vermont-specific:** Chittenden County's 80% AMI threshold for a 3-person household is around $96,750 (2026 — verify at filing). Most rural counties run 15-25% lower. **Trap:** many Vermont households qualify for the income-eligible tier and never apply because they assume they make too much. The actual income limit is higher than people guess. Look up your county's 80% AMI for your household size at HUD's data tables before assuming standard tier.

In practice, a $6,000 weatherization project nets $4,500 paid by EVT to the contractor at job completion. Your out-of-pocket: $1,500. The rebate shows up as a net invoice line, not as a separate check.

**Trap:** the contractor who bids a $4,500 project as "$1,125 after rebate" — implying you receive a check. The rebate goes to the contractor. Confirm in writing whether the bid is "before EVT rebate" or "your net out-of-pocket after rebate." Bids that don't clarify are concealing about $3,000 in EVT money flowing through to the contractor.`,
    },
    {
      h2: 'Why contractor selection determines the rebate',
      body: `EVT's Home Performance program requires a participating contractor. The list is at efficiencyvermont.com/find-contractor. Non-participating = rebate forfeit, period.

**Vermont-specific:** EVT participation isn't permanent. Contractors get added when they meet program requirements; they get removed when they fail QA reviews or submit too many incomplete rebate filings. The list shifts. Verify participation at the time of bid review, not based on what the contractor told a neighbor two years ago.

**Trap:** the cheaper non-participating contractor whose bid is $2,000 below the participating one. Their bid wins on paper, then loses on the rebate forfeit. A $6,000 weatherization project at 75% rebate is a real $4,500 difference. The participating contractor at $7,500 nets you $3,000 out-of-pocket; the non-participating at $5,500 nets you $5,500. The "savings" cost $2,500.

**What to do:** confirm participation in writing on the contractor's letterhead. Ask how many EVT rebate filings they've submitted in the past 12 months and how many were rejected. Long-time participants with clean filing histories know the paperwork; new participants sometimes drop the ball.`,
    },
    {
      h2: 'How to sequence with a heat pump install',
      body: `Weatherize first, then size the heat pump. EVT's program logic explicitly assumes this order — heat pump rebates are larger when paired with prior weatherization, and the heat pump sizing math is 15-25% cheaper for a weatherized home.

**The realistic sequence:**

Step 1 — schedule an EVT energy audit ($300-500, often free if you qualify). This produces the scope of work and the rebate-eligibility map.

Step 2 — air-seal and insulate. Typical timeline: 3-7 days of contractor work plus blower-door test before and after. Total elapsed time: 1-3 weeks depending on scope.

Step 3 — re-test. The post-weatherization blower-door test confirms the air-sealing was effective and informs the heat pump sizing.

Step 4 — size and install heat pump. Now the contractor knows the home's actual heat load post-weatherization. The system is sized correctly the first time.

**Trap:** the homeowner who installs a heat pump first ("we'll weatherize next year"). The heat pump is now oversized, runs short cycles, costs more to operate. Resizing later means swapping the system. Sequence matters more than budget; reverse it and you lose 15-25% in operating cost over the life of the system.`,
    },
    {
      h2: 'DIY weatherization rebate (the small one)',
      body: `EVT's DIY weatherization rebate pays $100 cash back on materials. Submit receipts within 90 days of purchase. This is the only rebate in the program that isn't paid through a contractor.

**Vermont-specific:** the DIY rebate covers caulk, weatherstripping, foam sealant, pipe insulation, attic hatch insulation kits — the small-scale stuff most homeowners can do themselves on a Saturday. It does NOT cover the larger scope items (insulation, blower-door tested air sealing) that require professional installation.

**Worth knowing:** a $200-300 DIY project at $100 rebate is fine economics, but it's not the same scale as a $6,000 project at $4,500 EVT rebate. Don't confuse the two. The DIY rebate is a small assist, not the main event.

**What to do:** if you're on a tight budget and the EVT-contractor route is unaffordable, use the DIY rebate to do air-sealing on attic hatches, top plates, basement rim joists. That's the highest-value DIY scope. Then save toward the full EVT-contractor project for next year.`,
    },
    {
      h2: 'When EVT funding runs out (and what to do)',
      body: `EVT's annual funding pot is appropriated by the Vermont Legislature. Historically, the pot runs out in late November or early December most years. Once depleted, projects scheduled for the remainder of the year don't get the rebate, or get a reduced one.

**Vermont-specific:** the rebate is locked when the contractor files paperwork with EVT before work starts. The acknowledgment from EVT secures the rebate against the funding pot. Filing late in the year is risky.

**What to do:** if you want a 2026 weatherization project, sign the contract by October 15. The contractor files paperwork, EVT acknowledges, the rebate is locked. Projects starting in November are racing the clock; projects starting in December are usually pushed to January 2027 funding.

**Trap:** assuming "we'll handle the paperwork" means it's done. Some contractors batch rebate filings and submit at year-end. If the year-end submission is on December 28 and the funding pot ran out on December 1, you may not get the rebate. **Verify with** the contractor in writing that the EVT acknowledgment has been received before work begins.`,
    },
    {
      h2: 'What costs after rebate in real dollars',
      body: `Specific scenarios for a typical Vermont weatherization project, mid-2026 numbers:

**Standard tier, $6,000 scope, 75% rebate:** $4,500 paid by EVT to contractor. Your out-of-pocket: $1,500.

**Standard tier, $12,000 full-scope project, 75% rebate (capped):** project hits the standard-tier rebate cap around $7,700 in stacked rebates. Out-of-pocket: $4,300.

**Income-eligible tier, $6,000 scope, 90% rebate:** $5,400 paid by EVT. Your out-of-pocket: $600.

**Income-eligible tier, $18,000 full-scope project (deep retrofit), 90% rebate (capped):** rebate hits around $16,700 capped. Out-of-pocket: $1,300.

**Vermont-specific:** the highest-value scopes in older Vermont homes are usually attic air-sealing + R-49 insulation + basement rim joist sealing, in that order. A blower-door test directs the work. Wall insulation is more complicated and usually has a longer payback.

**Worth knowing:** weatherization payback periods in Vermont run 3-7 years on energy savings alone for typical scopes — faster than nearly any other US state because of the heating-degree-day math.`,
    },
  ],

  faq: [
    {
      question: 'Do I get the EVT 75% rebate as a check, or is it taken off my invoice?',
      answer: 'Taken off your invoice. EVT pays the rebate directly to the participating contractor at job completion. The rebate shows up as a net invoice line. Confirm with the contractor whether their bid is "before rebate" or "your net out-of-pocket after rebate." Ambiguous bids hide $3,000+ in EVT money flowing to the contractor.',
    },
    {
      question: 'How do I qualify for the income-eligible 90% tier?',
      answer: 'Household income at or below 80% AMI for your county and household size. Chittenden County 3-person threshold is around $96,750 in 2026. Most rural counties run 15-25% lower. Check HUD\'s data tables for your specific county/household before assuming standard tier — many Vermont households qualify and never apply.',
    },
    {
      question: 'What if my contractor isn\'t on the EVT participating list?',
      answer: 'You forfeit the rebate. Period. Confirm participation in writing on the contractor\'s letterhead at bid review. The list is at efficiencyvermont.com/find-contractor. A non-participating contractor whose bid is $2,000 lower can cost you $3,000+ in lost rebate.',
    },
    {
      question: 'Should I weatherize before or after a heat pump install?',
      answer: 'Before. Weatherized homes need smaller, cheaper heat pumps. EVT designs the program around this order; rebates are larger when paired with prior weatherization, and the heat pump is correctly sized the first time. Reversing the order leaves you with an oversized system that costs 15-25% more to operate.',
    },
    {
      question: 'Will the 2026 EVT rebate run out before year-end?',
      answer: 'Historically yes — late November or early December most years. Sign your contract by October 15. The contractor files rebate paperwork before work starts; the EVT acknowledgment is what locks the rebate to the project. Projects starting in November are racing the clock.',
    },
  ],

  factIds: [
    'evt-weatherization-standard-tier',
    'evt-weatherization-income-eligible',
    'evt-diy-weatherization-rebate',
    'evt-ducted-heat-pump-rebate',
    'federal-25c-expired',
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
