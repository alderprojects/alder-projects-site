import type { TopicGuideContent } from '../templates/topic-guide-template'

// ADU permit + cost guide — Act 47 changed the legal landscape;
// the engineering reality (septic, electrical, setbacks) didn't.

export const VERMONT_ADU_PERMIT_COST_2026_CONTENT: TopicGuideContent = {
  slug: 'vermont-adu-permit-cost-2026',
  topicId: 'addition_adu',
  metaTitle: "Vermont ADU permit + cost 2026 — Act 47 freedom, engineering reality",
  metaDescription: "Vermont's Act 47 (July 2024) made ADUs by-right statewide. The size cap is gone — but septic, electrical, and setbacks still apply. What an ADU actually costs in 2026.",
  h1: "Vermont ADU permit + cost — Act 47 doesn't override engineering.",

  leadParagraph: "Vermont Act 47 (in effect since July 2024) means your town's old 'no ADUs over 800 sq ft' rule isn't enforceable. But the wastewater permit, electrical upgrade, and septic engineer bill still apply. The Act 47 freedom doesn't remove the engineering reality. A 900 sq ft ADU build in Vermont runs $85,000-175,000 plus $2,000-5,000 in state wastewater permits — before any local town permit fees.",

  sections: [
    {
      h2: "What Act 47 actually changed",
      body: `Vermont's Act 47 (H.687, signed June 2024, effective July 2024) made accessory dwelling units (ADUs) by-right statewide. That means town zoning bylaws that capped ADUs — "no ADUs over 800 sq ft," "no detached ADUs," "ADUs require special permit" — are no longer enforceable.

**What towns can still regulate:** setbacks from property lines, lot coverage limits, parking requirements, height limits, and the practical building permit process. **What towns can't regulate:** the basic right to add an ADU, ADU size caps below state standards, owner-occupancy requirements (in most cases — verify by lot).

**Vermont-specific:** the law applies to all residentially-zoned land in Vermont. There are limited exceptions for specific historic districts and conservation overlays — verify by lot before designing.

**Trap:** the homeowner who assumes Act 47 means everything is permittable. Setbacks, lot coverage, septic capacity, and electrical service still constrain ADUs. A 1,200 sq ft ADU on a small lot served by a 3-bedroom septic system requires a septic upgrade ($15,000-30,000 conventional, $30,000-45,000 engineered) before the ADU permit goes anywhere — regardless of what Act 47 says about the town's old size cap.

**What to do:** start with two checks before designing. First, verify ADU eligibility for your specific lot with the town zoning office. Second, check septic capacity with a Vermont-licensed septic engineer. The combination determines what's possible.`,
    },
    {
      h2: 'The actual cost of a Vermont ADU build',
      body: `Vermont ADU costs as of mid-2026 (verified April 2026):

**Detached ADU, 700-900 sq ft:** $85,000-175,000 fully built. Resort-tier towns reach $140,000-230,000. Includes foundation, framing, roof, exterior, full interior including kitchen, bath, finishes.

**Attached ADU (added to existing house):** $90,000-180,000 typical. Often higher than detached because of structural complications (existing foundation tie-in, utilities running through the existing house, drywall/finish matching).

**Garage conversion to ADU:** $50,000-130,000 if the garage is structurally sound. Cheaper than ground-up because foundation and roof exist. More expensive than expected because converting requires upgrading insulation, electrical, plumbing, and likely heat from scratch.

**Vermont-specific cost drivers:** electrical service upgrade ($3,000-7,500 if existing 100-amp service can't carry the additional load); wastewater permit ($300-1,500); septic system upgrade if needed ($15,000-30,000 conventional, $30,000-45,000 engineered); town building permit fees ($500-2,000 typical). Resort towns layer on design review costs ($1,500-5,000).

**Trap:** the bid that quotes "complete ADU build" at $90,000 without breaking out the wastewater permit, septic engineer, and electrical upgrade as separate line items. Ask explicitly: "Does this include the state wastewater permit? Is the septic engineer's evaluation included? Does this include the electrical service upgrade if needed?" Hidden line items are how $90,000 quotes become $130,000 invoices.`,
    },
    {
      h2: 'Wastewater permit and septic capacity',
      body: `Vermont requires a wastewater and potable water supply permit for any project that adds bedroom capacity or changes the number of plumbing fixtures. ADUs trigger this almost universally.

**Vermont-specific:** the permit is administered by the Vermont DEC. For most residential ADUs the permit is straightforward — a licensed septic engineer evaluates your existing system, confirms it can handle the additional design flow, and files the permit. Cost: $300-1,500 for the permit, plus $500-1,500 for the septic engineer's evaluation.

**Trap:** the homeowner who designs the ADU first, then checks septic. The architect draws plans. You get excited. Then the septic engineer says the system can't handle the additional load and needs a $25,000 upgrade in different soil. The design is wasted because the septic dictates where the ADU can sit and how big it can be.

**What to do:** before the architect, get a Vermont-licensed septic engineer to evaluate existing capacity. The engineer's report tells you: current design flow capacity, required design flow for your planned ADU, and whether an upgrade is needed. $500-1,500 well spent.

**Vermont-specific:** Vermont sizes septic systems by bedroom count, not by occupancy or square footage. A 900 sq ft ADU with a single bedroom counts as one bedroom for septic purposes. A 700 sq ft ADU with a den, office, and a bedroom (where the den could be used as a bedroom) counts as three bedrooms — even if you call them by different names. Inspectors apply a "could be used as" test, not a labels-on-paper test.`,
    },
    {
      h2: 'Setbacks, lot coverage, and parking',
      body: `Act 47 doesn't override town setbacks, lot coverage caps, or parking requirements. These remain the binding constraints on most lots.

**Vermont-specific:** typical Vermont residential setbacks run 10-30 feet from property lines, with side and rear setbacks often shorter than front. Your specific town's bylaws govern. **Verify with** the town zoning office before designing.

**Lot coverage** — most towns cap the percentage of a lot that can be impervious surface or buildings. Adding a 900 sq ft ADU to a small lot can push you over the cap. Calculate before designing.

**Parking** — most towns require 1-2 parking spaces per dwelling unit. Adding an ADU adds a unit. If your lot can't accommodate the additional parking, you may need a variance.

**Trap:** the design that meets the town size standards but exceeds setbacks or lot coverage. The town will deny the building permit even though Act 47 made the ADU itself permittable. Setback variances require a public hearing and aren't guaranteed. **What to do:** confirm setback compliance with town zoning before signing an architect contract.`,
    },
    {
      h2: 'Owner-occupancy and rental rules',
      body: `Act 47 generally removed owner-occupancy requirements for ADUs in most Vermont towns. Some towns retain limited owner-occupancy rules for specific districts — verify by lot.

**Short-term rental (Airbnb / VRBO):** Vermont state law and most town bylaws permit STRs from ADUs, but with conditions. Vermont state lodging tax (9% combined) applies. Many towns layer on additional registration requirements ($100-500/year) and zoning conditions.

**Long-term rental:** generally permitted by Act 47. Some towns retain specific tenant-occupancy rules (e.g., maximum number of unrelated occupants).

**Vermont-specific:** Middlebury tightened student rental conversion rules in 2025, capping unrelated occupants per dwelling unit. Some other Vermont towns are considering similar measures. **Verify with** town zoning before assuming a specific rental yield.

**Trap:** the homeowner who designs an ADU specifically for short-term rental, then discovers the town requires additional STR permits, lodging-tax compliance, and 1-2 parking spaces beyond what the lot provides. The "passive income from Airbnb" projection breaks down on the operational details. **What to do:** if rental income is the project driver, talk to the town zoning office about STR rules and check the actual rental market for ADUs in your area before signing.`,
    },
    {
      h2: 'Sequencing the project',
      body: `The order that protects your budget:

**Step 1: town zoning + septic capacity check.** No design work until you know what's possible. $500-1,500 for the septic engineer; free for the town zoning conversation. 1-3 weeks of elapsed time.

**Step 2: design (architect or design-build contractor).** Now bound by what the lot allows. Architect fees $5,000-15,000 for a typical residential ADU. Design-build contractors sometimes bundle design into the contract.

**Step 3: state wastewater permit.** Filed by septic engineer. $300-1,500 in permit fees. Processing 4-12 weeks.

**Step 4: town building permit.** Filed once design is final and wastewater permit is approved. $500-2,000 in permit fees. Processing 2-8 weeks.

**Step 5: electrical service upgrade (if needed).** Some Vermont homes need 200-amp service to support an ADU. $3,000-7,500. Often best done early to avoid scheduling conflicts during construction.

**Step 6: build.** 4-8 months for typical detached ADU; 3-6 months for attached or garage conversion.

**Trap:** rushing through Steps 1-3 and treating the design as final before permits are issued. Plans get bounced; revisions cost real money in architect fees and elapsed time. The careful sequence costs less than the impatient one.

**Worth knowing:** total elapsed time from start of process to ADU move-in is typically 12-18 months. Expect the project to dominate your year if you start.`,
    },
  ],

  faq: [
    {
      question: 'Did Vermont Act 47 really make ADUs by-right statewide?',
      answer: 'Yes. Effective July 2024. Town zoning bylaws capping ADU size below state standards, requiring special permits, or banning detached ADUs are no longer enforceable. Towns can still regulate setbacks, lot coverage, parking, and height. Verify your specific lot with the town zoning office before designing.',
    },
    {
      question: 'How much does a 900 sq ft Vermont ADU cost to build in 2026?',
      answer: '$85,000-175,000 typical for detached, $90,000-180,000 for attached, $50,000-130,000 for garage conversion. Plus $2,000-5,000 in state wastewater permits, septic engineer fees, and town building permits. Resort towns add 30-40% more.',
    },
    {
      question: 'Do I need a wastewater permit for my Vermont ADU?',
      answer: 'Yes — almost always. Any project that adds bedroom capacity or changes plumbing fixtures triggers Vermont DEC wastewater permit requirements. $300-1,500 in permit fees plus $500-1,500 for the licensed septic engineer\'s evaluation. Check septic capacity before designing the ADU, not after.',
    },
    {
      question: 'Can I rent my Vermont ADU on Airbnb?',
      answer: "Generally yes, but with conditions: 9% Vermont lodging tax, town STR registration requirements ($100-500/year typical), parking and zoning conditions vary by town. Some towns are tightening STR rules. Verify with town zoning before assuming the rental yield works.",
    },
    {
      question: 'How long does the full Vermont ADU process take?',
      answer: '12-18 months from start to move-in. Step 1 (zoning + septic check): 1-3 weeks. Step 2 (design): 2-4 months. Step 3 (state wastewater permit): 4-12 weeks. Step 4 (town building permit): 2-8 weeks. Step 5 (electrical upgrade): 1-2 weeks. Step 6 (build): 4-8 months for detached.',
    },
  ],

  factIds: [
    'vt-act-47-adu',
    'vt-cost-adu',
    'vt-cost-septic-conventional',
    'vt-cost-septic-engineered',
    'vt-residential-contract-statute',
    'vt-contractor-registration-threshold',
  ],

  relatedGuideSlugs: [
    'can-i-add-bedroom-vermont-lake-house',
    'vermont-septic-what-to-know',
    'vermont-renovation-permit-guide',
    'how-to-find-contractor-vermont',
    'vermont-contractor-red-flags',
  ],

  relatedTownSlugs: ['burlington-vt', 'vergennes-vt', 'middlebury-vt', 'montpelier-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
