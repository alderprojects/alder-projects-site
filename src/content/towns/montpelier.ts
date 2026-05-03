import type { TownPageContent } from '../templates/town-page-template'

// Montpelier — small_city tier. The capital. ~8k residents,
// half employed by state government. July 2023 flooding hit
// downtown hard; the floodplain question dominates renovation
// math for any property south of State Street near the
// Winooski.

export const MONTPELIER_CONTENT: TownPageContent = {
  slug: 'montpelier-vt',
  townName: 'Montpelier',
  county: 'Washington County',
  townTier: 'small_city',
  utility: 'Green Mountain Power (GMP)',
  population: 8064,
  medianHomeValue: 350000,

  metaTitle: 'Montpelier, VT property guide — costs, flood zone reality, rebates',
  metaDescription: "What it actually costs to renovate, weatherize, and flood-proof a Montpelier property in 2026. Post-2023 flood reality, FEMA 50% rule, EVT and GMP rebate stacks. Built for Montpelier homeowners.",
  h1: "Montpelier, Vermont — capital city, flood reality, narrow window for permits.",

  leadParagraph: "Montpelier is the capital. About half of the homeowners work for the state, which shapes the renovation market — predictable salaries, predictable timelines, but also the July 2023 flooding that put two feet of water in the basements of half the downtown houses. The floodplain question now dominates every renovation conversation south of State Street.",

  sections: [
    {
      h2: 'The 2023 flood and what it changed',
      body: `July 10-11, 2023: the Winooski crested historically high, with the flooding extending well beyond the historical FEMA flood zone. Many properties that had never flooded were under water. The damage reshaped how Montpelier homeowners and lenders think about renovation in flood-adjacent properties.

**Vermont-specific:** FEMA's flood map for Montpelier is being updated in response to 2023, but the new maps haven't been finalized as of this writing (verify status before signing anything). In practice: even properties technically outside the current Zone AE are now treated by lenders as flood-risk during financing, and insurers price accordingly.

**Trap:** the renovation that pushes a Montpelier property over FEMA's 50% substantial improvement threshold. If your project cost exceeds 50% of the building's pre-improvement market value (building, not land), the entire structure must be brought into compliance with current floodplain regulations — typically, raising the structure above the base flood elevation. A $50,000 kitchen remodel on a $90,000-assessed-value home triggers this. The fix is to phase your work or know what you're walking into. Get an elevation certificate ($300-600) before bid review.`,
    },
    {
      h2: 'How the state-employee market shapes contractor work',
      body: `About half of Montpelier homeowners are state employees. That's predictable income, predictable mortgage approvals, and predictable timing — which means contractors plan around the August-to-October window when state-employee homeowners do most of their major work.

**Worth knowing:** the contractor backlog peaks in August through early October. By July, the good Montpelier-based GCs are turning down work that doesn't start by Labor Day. If you want a fall project completed before deep winter, book by April. If you want spring work, book in October-November.

**Vermont-specific:** Washington County's contractor density is higher than Addison or Caledonia counties, so you'll see more bidding competition than Vergennes — but lower than Burlington. Expect 3-5 serious bids in a typical project window.

**Trap:** the bid that prices the project as "Burlington-ish" because the contractor commutes from Chittenden County. Their windshield time is real and ends up in your number — sometimes hidden as a higher hourly rate, sometimes as overtime once they figure out the drive cost. Ask each bidder where their crew is based. Local-Montpelier crews almost always price more honestly for Montpelier work.`,
    },
    {
      h2: 'Project costs in Montpelier',
      body: `Montpelier runs at statewide median for most categories — the small_city tier. As of mid-2026:

**Heat pump install** — $11,000-22,000 ducted, $3,500-5,500 ductless single zone. EVT ducted rebate is $2,200, plus the GMP $2,000-per-condenser bonus if you're income-eligible. Stack with the $400 EVT fuel-switching bonus for oil removal.

**Kitchen remodel** — $35,000-65,000 mid-range, $60,000-95,000 full gut.

**Bathroom remodel** — $12,000-25,000 mid-range. Older Montpelier homes (most of the housing stock pre-dates 1940) often have galvanized supply lines that need full replacement during a bath remodel — add $1,500-3,500 if so.

**Whole-home weatherization** — $4,000-18,000 typical. Montpelier's older housing stock means weatherization payback is faster here than newer construction. EVT 75% rebate brings net cost to $1,000-4,500.

**Worth knowing:** post-2023, basement waterproofing and flood mitigation are the highest-demand non-cosmetic projects in Montpelier. Plan on $5,000-25,000 for a real basement waterproofing job — interior drainage tile, sump system, exterior grading. Cosmetic dehumidifier solutions don't survive a real flood event.`,
    },
    {
      h2: 'Heat pump rebates that stack in Montpelier',
      body: `Montpelier is in Green Mountain Power (GMP) territory. The rebate stack for a typical ducted heat pump install:

- $2,200 EVT ducted rebate (verified April 2026, paid to contractor at job completion)
- $2,000 GMP income-eligible bonus per condenser (if at or below 80% AMI — installer confirms when filing)
- $400 EVT fuel-switching bonus (if removing oil furnace as primary heat)
- $500 EVT electrical service upgrade rebate (if panel upgrade is part of the install)

Income-eligible total stack: $5,100 on a typical $14,000-16,000 install. Out-of-pocket lands around $10,000.

**Trap:** the contractor who bids the rebate as a discount on the invoice when you're not actually income-eligible. The GMP bonus requires AMI verification — Chittenden's 80% AMI threshold for a 3-person household is around $96,750 (verify current at filing time). Income-eligibility is the contractor's responsibility to verify; bids that promise the bonus without checking are skipping a step.`,
    },
  ],

  faq: [
    {
      question: 'Do I need a flood-zone permit for renovations in Montpelier after the 2023 flood?',
      answer: "Depends on your property's FEMA zone and whether your project triggers the 50% substantial improvement rule. Get an elevation certificate ($300-600) before bid review. The 50% rule is calculated on building value (not land), and crossing it forces the whole structure to comply with current floodplain regulations.",
    },
    {
      question: 'When do Montpelier contractors book up?',
      answer: 'August-October peak. State-employee homeowners drive the demand cycle. Book April for fall, October-November for spring after mud season.',
    },
    {
      question: 'Are GMP heat pump rebates the same here as in Burlington?',
      answer: "GMP's $2,000-per-condenser income-eligible bonus applies in Montpelier (GMP territory) but NOT in Burlington (BED territory). The EVT statewide rebates ($2,200 ducted, $475 ductless head, $400 fuel-switching) apply equally regardless of utility.",
    },
    {
      question: 'How much will basement waterproofing cost in Montpelier?',
      answer: '$5,000-25,000 for a real job (interior drainage tile, sump system, exterior grading where feasible). Cosmetic dehumidifier-only solutions don\'t survive a 2023-scale event. Get a structural-trained waterproofing contractor, not a dehumidifier salesperson.',
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-electrical-service-upgrade',
    'evt-weatherization-standard-tier',
    'gmp-heat-pump-income-bonus',
    'vt-cost-elevation-cert',
    'vt-cost-flood-insurance',
    'vt-cost-heat-pump-ducted',
    'vt-cost-weatherization-whole-home',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'vermont-flood-zone-renovation',
    'vermont-renovation-permit-guide',
    'how-to-find-contractor-vermont',
    'how-much-does-kitchen-remodel-cost-vermont',
  ],

  relatedServiceSlugs: [],

  sampleAddress: 'Main Street, Montpelier, VT',
  samplePropertySlug: 'main-street-montpelier-vt',

  verifyDate: '2026-05-03',
}
