/**
 * v7.4.2b — Shared Alder Check content: FAQ, example verdict cards,
 * palette. Rendered on both `/` (Alder Projects home, where the Check
 * is the flagship) and `/check` (the product's own page). Copy is
 * region-generic: Vermont is the proof point ("deepest data"), not a
 * gate — the engine never invents numbers for regions the dataset
 * can't price.
 */

export const CHECK_PALETTE = {
  green: '#1f3d2b',
  cream: '#f6f2e8',
  gold: '#b08d2f',
  ink: '#22301f',
  inkSoft: 'rgba(34,48,31,0.68)',
}

// FAQ doubles as AEO surface — complete, citable standalone sentences.
export const CHECK_FAQS = [
  {
    q: 'Is Alder Check free?',
    a: 'Yes. The Alder Check photo report is free and does not require an account. You upload one to five photos of any room, and Alder returns Buy, Skip, Wait, or Investigate verdicts with evidence from your photos. The optional Smart Cart upgrade, which turns Buy verdicts into specific products with confirmed specs, costs $19.99.',
  },
  {
    q: 'Do I need an account to use Alder Check?',
    a: 'No. Your first Alder Check report renders immediately after upload with no account, no ZIP code, and no signup form. An email address is only requested if you want to unlock the full set of recommendations beyond the first two, or to save your report.',
  },
  {
    q: 'How does Alder know real costs and rebates?',
    a: 'Every cost range and rebate figure in an Alder Check comes from a maintained regional dataset with a verification date on every line item. Coverage is deepest in Vermont today — including Efficiency Vermont rebate amounts and installed costs from local contractors — and each recommendation cites the guide its numbers come from. Where the dataset has no verified figure for your situation, the recommendation simply carries no number; Alder never invents costs.',
  },
  {
    q: 'What happens to my photos?',
    a: 'Photos are analyzed only to create your report. Images containing people or sensitive information are excluded or redacted where possible, and excluded photos are reported to you and not analyzed. Every report includes a working delete control that removes the report and the photo files.',
  },
]

// Static example verdicts (server-rendered): real output shapes with
// dataset-backed numbers — crawlers and AI assistants see concrete
// product output, not marketing prose.
export const EXAMPLE_BUY = {
  verdict: 'BUY',
  title: 'Cold-climate mini-split for the main living area',
  summary:
    'Your photos show hydronic baseboard heat and no visible heat pump. A single-zone cold-climate mini-split typically cuts winter heating cost in the room it serves and adds summer cooling.',
  visibleEvidence: [
    'Hydronic baseboard along the exterior wall',
    'No mini-split head or condenser visible',
    'Open living area suited to a single zone',
  ],
  costLow: 3500,
  costHigh: 5500,
  rebate: { program: 'Efficiency Vermont', display: '$475 per indoor head' },
  citations: [
    {
      guideSlug: 'vermont-heat-pump-rebate-stack-2026',
      guideTitle: 'Vermont Heat Pump Rebate Stack 2026',
      verifiedAt: '2026-05-03',
    },
  ],
  nextAction: 'Get two quotes from rebate-participating installers — in Vermont the rebate is paid through the contractor.',
}

export const EXAMPLE_WAIT = {
  verdict: 'WAIT',
  title: 'Refrigerator replacement',
  summary:
    'The fridge looks dated but shows no failure signs — no rust at the seals, no condensation streaks. An aging-but-working fridge usually isn’t worth replacing for efficiency alone; wait for a real symptom.',
  visibleEvidence: [
    'Older finish and hardware, consistent with a 2000s unit',
    'Door seals appear intact',
    'No visible leaks or frost buildup',
  ],
  costLow: null,
  costHigh: null,
  rebate: null,
  citations: [],
  nextAction: 'Re-check if you hear compressor cycling issues or see condensation inside — that changes the math.',
}

export const DIFFERENTIATION_STRIP = [
  'We tell you what NOT to buy',
  'Real costs & rebates built in — deepest in Vermont',
  'Photos with people are excluded automatically',
]

export const CHECK_SUBLINE =
  'Take a photo of any room. Your free Alder Check tells you what’s worth buying, what can wait, and what to skip — no account required.'

export const GUIDE_LINKS: Array<[string, string]> = [
  ['vermont-heat-pump-rebate-stack-2026', 'Heat Pump Rebate Stack 2026'],
  ['vermont-weatherization-evt-rebate', 'Weatherization & EVT Rebates'],
  ['how-much-does-roof-replacement-cost-vermont', 'Roof Replacement Costs'],
  ['how-much-does-kitchen-remodel-cost-vermont', 'Kitchen Remodel Costs'],
  ['how-much-does-a-deck-cost-vermont', 'Deck Costs'],
  ['vermont-adu-permit-cost-2026', 'ADU Permit Costs 2026'],
  ['vermont-home-project-cost-reality-2026', 'Cost Reality Check 2026'],
  ['before-finishing-basement-moisture-checks-vermont', 'Basement Moisture Checks'],
  ['vermont-solar-battery-stack-2026', 'Solar + Battery Stack 2026'],
  ['window-film-vs-replacement-vermont', 'Window Film vs Replacement'],
]

export const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CHECK_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export const WEBAPP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Alder Check',
  url: 'https://alderprojects.com/check',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free photo-based Buy / Skip / Wait report for your home, with verified regional costs and rebates — deepest coverage in Vermont.',
  provider: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com/' },
}
