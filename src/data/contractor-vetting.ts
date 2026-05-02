// VT-specific contractor vetting guidance.
// What to actually check before signing with a Vermont contractor.
// Most homeowner-protection checklists online are written for high-regulation
// states (CA, MA, NY) and don't reflect Vermont's reality:
//   - Vermont does NOT license general contractors at the state level.
//     There is no "GC license" to look up. (Some trades are licensed —
//     electricians, plumbers, LP gas — but "general contractor" isn't.)
//   - Vermont DOES require contractor registration with the AG's office for
//     residential construction projects of $3,500+ (the Residential Contractor
//     Registration program, in effect since 2021).
//   - The actual signal of a good contractor in VT is referrals + insurance
//     verification + a real written contract. License lookup theater
//     does not work here the way it does elsewhere.

import type { State } from './_types'
import { DEFAULT_STATE } from './_types'

export type VettingStep = {
  id: string
  state: State
  name: string
  // What this is, plainly
  description: string
  // Why it matters specifically in Vermont
  vtRationale: string
  // How to actually do it
  howTo: string[]
  // Common red flags this step catches
  redFlags: string[]
  // Effort level
  effort: 'low' | 'medium' | 'high'
  // Stakes — when this matters most
  criticalFor: string[]
}

export const VETTING_STEPS: VettingStep[] = [
  {
    id: 'registration-check',
    state: 'VT',
    name: 'Verify Residential Contractor Registration with VT AG',
    description: "Vermont requires anyone doing residential construction work of $3,500+ to register with the Attorney General's Consumer Assistance Program.",
    vtRationale: 'Registration is the closest VT has to a license. It is FREE for the contractor. Anyone refusing to register or working unregistered on a $3,500+ job is breaking VT law and waiving most of your consumer protections in advance.',
    howTo: [
      "Search the VT AG's registry at ago.vermont.gov/cap (look for \"contractor registration\")",
      'Confirm the legal business name matches what is on their bid/contract',
      "Note any complaints listed against them in the AG's database",
      "For projects under $3,500, registration isn't required — but reputable contractors register anyway",
    ],
    redFlags: [
      'Not registered for any project over $3,500',
      'Multiple complaints in AG database',
      'Business operating under a different name than what is registered',
      "Tells you registration \"isn't a real thing\" or \"doesn't apply to them\"",
    ],
    effort: 'low',
    criticalFor: ['any project over $3,500', 'any project with significant deposit'],
  },
  {
    id: 'insurance-verification',
    state: 'VT',
    name: 'Get a current Certificate of Insurance — directly from their insurer',
    description: 'Verify both general liability AND workers comp insurance is in force, with you (the homeowner) listed as a Certificate Holder.',
    vtRationale: "If a contractor falls off your roof and they don't have workers comp, YOUR homeowners policy gets sued. VT homeowners policies typically exclude on-the-job injury claims for uninsured contractors. This is the single biggest financial risk you can avoid.",
    howTo: [
      'Ask for a Certificate of Insurance (COI), not just "proof of insurance"',
      'The COI must be issued BY THE INSURER, not the contractor — fakes are common',
      'Verify the policy is current (effective dates cover the project window)',
      'Check it lists General Liability AND Workers Compensation',
      'Workers comp must show coverage for the contractor AND any subs they bring',
      'Call the insurance agent listed on the COI to confirm the policy is active. Takes 5 minutes.',
    ],
    redFlags: [
      'Hesitates to provide COI or sends a screenshot/photo',
      "Provides COI but won't add you as Certificate Holder",
      'Workers comp coverage shows only the owner-operator (no sub coverage)',
      'Policy expired or expires mid-project',
      'Tells you "I have insurance through my LLC" without specifics',
      "Says VT doesn't require workers comp for solo operators (technically true, but a solo operator who falls is your problem)",
    ],
    effort: 'low',
    criticalFor: ['any roof work', 'any tree work', 'any project with subcontractors', 'any project on a multi-story home'],
  },
  {
    id: 'three-references',
    state: 'VT',
    name: 'Call three real references from the past 12 months',
    description: 'Ask for and actually call three recent clients with similar-scope projects in similar VT towns.',
    vtRationale: 'In Vermont, referrals matter more than online reviews. The contractor pool is small, the communities are small, and a contractor who has burned even one homeowner has a reputation problem. Talking to three recent clients gives you signal that 50 Google reviews cannot.',
    howTo: [
      'Ask for THREE references — most contractors offer one or two; three forces them to actually have done the work',
      'Specifically request: completed within the past 12 months, similar scope, similar town',
      "Call (don't email) — voice tone reveals everything",
      'Ask: did they finish on time? On budget? Did they communicate? Would you hire them again?',
      'Ask the killer question: was there ANYTHING that surprised you, in good or bad ways?',
    ],
    redFlags: [
      'Can only provide one or two references',
      'All references are out-of-state or from years ago',
      'References sound coached or read from a script',
      'References hesitate when asked "would you hire them again"',
      'Contractor refuses to share references citing "privacy"',
    ],
    effort: 'medium',
    criticalFor: ['any project over $10,000', 'first-time hire of unknown contractor'],
  },
  {
    id: 'site-visit-existing',
    state: 'VT',
    name: 'Drive by an active or recent jobsite',
    description: 'Visit a site where the contractor is currently working or recently finished, ideally unannounced.',
    vtRationale: "In Vermont, contractors' active jobsites tell you everything. Drive past on a Tuesday afternoon. Is the site organized? Are tools out and being used? Is debris contained? Does the contractor's crew look like one team or a rotating cast of subs you have never met? Vermont is small enough that you can usually find a current jobsite within 20 minutes of your house.",
    howTo: [
      'Ask the contractor for the address of an active jobsite (most are happy to brag)',
      'Drive by during work hours, just observe from the road',
      'Note: site cleanliness, dumpster presence, signage, vehicle markings',
      'If invited inside, ask the homeowner the killer question above',
    ],
    redFlags: [
      "Won't share any active jobsite addresses",
      'Site is chaotic, debris everywhere, no clear organization',
      'No marked vehicles — many flippers and fly-by-nights work in unmarked vans',
      'Different unfamiliar workers each visit — heavy sub use without disclosure',
    ],
    effort: 'medium',
    criticalFor: ['any major project', "any contractor you don't already have a referral for"],
  },
  {
    id: 'written-contract',
    state: 'VT',
    name: 'Insist on a written contract with specific Vermont protections',
    description: 'Get a real written contract before any work begins or money changes hands. Verbal agreements and "handshake deals" leave you with no recourse.',
    vtRationale: "Vermont law (9 V.S.A. § 4006) requires a written contract for residential work over $1,000 if it includes specific items: scope of work, total price, completion date, deposit terms, and the homeowner's 3-day right to cancel. A contract missing these is unenforceable AGAINST you, but the contractor still cashes your deposit.",
    howTo: [
      'Verify the contract names: legal business name, AG registration number, license numbers for trade work, and physical VT address',
      'Verify scope of work is detailed enough that you would not argue about it later',
      'Verify deposit terms: VT does NOT cap deposits, but anything over 30% upfront is a red flag',
      'Verify completion date AND a payment schedule tied to milestones, not calendar dates',
      'Confirm the 3-day right-to-cancel clause is present (required by VT law)',
      'Get a signed copy YOU keep — not just "the contractor has the original"',
    ],
    redFlags: [
      'No written contract; "trust me" agreements',
      'Demands more than 30% deposit upfront',
      'Demands cash only or check made out to a personal name',
      'Vague scope of work that can be reinterpreted later',
      'No 3-day right-to-cancel clause',
      'Calendar-based payment schedule (e.g., "50% in 2 weeks") instead of milestone-based',
      'Refuses to identify subcontractors',
    ],
    effort: 'low',
    criticalFor: ['every project over $1,000'],
  },
  {
    id: 'mechanic-lien-awareness',
    state: 'VT',
    name: "Understand how VT mechanic's liens work",
    description: "In Vermont, a contractor or supplier you never directly hired can file a lien on YOUR house if your contractor doesn't pay them.",
    vtRationale: "Mechanic's lien law in VT (9 V.S.A. Chapter 51) lets subcontractors and material suppliers attach a lien to your property if their general contractor stiffs them on payment. You could pay your GC in full, the GC walks away, the lumberyard never gets paid, and now you have a lien on your house. The defense is simple but most homeowners don't do it.",
    howTo: [
      'For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts',
      'For final payment, require lien waivers from the GC AND from each named sub/supplier',
      "A lien waiver is a one-page document the sub signs saying they've been paid",
      'For larger projects, consider escrowing final payment until all waivers are received',
      'Liens must be filed within 180 days of the last work — final waiver collection is your protection',
    ],
    redFlags: [
      'GC refuses to identify subs and suppliers',
      'GC refuses to provide lien waivers at final payment',
      'GC asks you to pay subs directly (this is unusual and shifts liability oddly)',
      'You hear from a sub that they have not been paid — pause your final payment immediately',
    ],
    effort: 'high',
    criticalFor: ['projects over $10,000', 'projects with multiple subs'],
  },
  {
    id: 'permit-pulling',
    state: 'VT',
    name: 'Confirm WHO is pulling the permits',
    description: 'For permitted work, the contractor should pull the permit in their name — not yours.',
    vtRationale: "In Vermont, the person whose name is on the building permit is responsible for code compliance. If you pull the permit (often called an \"owner-builder permit\"), you're legally on the hook for everything — including the contractor's mistakes. Some contractors push owner-pulled permits to dodge liability. This is a giant red flag.",
    howTo: [
      'Ask early: "who is pulling the permit?"',
      'Answer should be: "I am, in my name" or "my electrical sub will, in his name"',
      'For trade work (electrical, plumbing, gas), the licensed tradesperson should pull their own permit',
      'For general construction, the GC should pull the building permit',
    ],
    redFlags: [
      'Contractor wants YOU to pull the permit',
      "\"Don't worry about permits, no one will check\"",
      '"I can do this without a permit if you want to save money"',
      "Won't identify which trades need permits",
    ],
    effort: 'low',
    criticalFor: ['any work that requires a permit (most structural, electrical, plumbing, gas)'],
  },
  {
    id: 'red-flag-pricing',
    state: 'VT',
    name: 'Understand normal VT pricing — and when a quote is suspicious',
    description: 'Get three written bids and understand why the cheapest is usually a trap.',
    vtRationale: "Vermont is a small construction market with tight contractor schedules. Real VT contractors rarely undercut local pricing significantly — they don't need to. A quote 30%+ below the others usually means: missing scope, lowball bait-and-switch, or a non-local contractor underestimating VT-specific costs (mud season, building code, materials shipping). Sometimes the LOW bid is the dangerous one.",
    howTo: [
      'Get THREE bids on the same scope of work',
      'Compare scope, not just price — make sure each bid covers the same things',
      'For renovations: expect 10-20% spread between honest bids',
      'For new construction: expect 5-15% spread',
      "A bid 30%+ below the others is suspicious; ask the bidder what they're NOT including",
    ],
    redFlags: [
      'Single bidder claiming "only one in the area" — VT has plenty of contractors, this is a manipulation',
      'Lowest bid is dramatically lower (likely missing scope)',
      'Highest bid is dramatically higher with no good reason (overhead from non-VT firm, or padding for difficult clients)',
      'Bid structure that hides materials in "labor" or vice versa',
      "Quote that pretends to include rebate paperwork but doesn't specify which rebates",
    ],
    effort: 'medium',
    criticalFor: ['any project over $5,000'],
  },
]

// ---------- Helpers ----------

// Returns vetting steps for the requested state. Today every step is VT
// (rules cite VT-specific statutes and the AG registry).
export function getVettingStepsForState(state: State): VettingStep[] {
  return VETTING_STEPS.filter(s => s.state === state)
}

export function vettingStep(id: string): VettingStep | null {
  return VETTING_STEPS.find(s => s.id === id) || null
}

// Steps marked critical for a given project size
export function vettingForBudget(budget: number): VettingStep[] {
  return VETTING_STEPS.filter(s => {
    if (budget >= 10000) return true // all steps
    if (budget >= 5000) return s.id !== 'mechanic-lien-awareness'
    if (budget >= 1000) return ['registration-check', 'insurance-verification', 'written-contract', 'permit-pulling'].includes(s.id)
    return ['written-contract'].includes(s.id)
  })
}

// Compact summary for system-prompt injection.
// State param accepted for forward compatibility; today only VT data exists,
// and the copy below is VT-specific so the function does not vary by state yet.
export function vettingSummaryForPrompt(_state: State = DEFAULT_STATE): string {
  const lines: string[] = []
  lines.push('VT CONTRACTOR VETTING — KEY FACTS')
  lines.push('')
  lines.push('UNIQUE VT REALITIES:')
  lines.push('- Vermont does NOT license general contractors at the state level. There is no GC license to look up.')
  lines.push("- VT DOES require contractor registration with the AG's Consumer Assistance Program for residential work $3,500+.")
  lines.push('- Trades (electrical, plumbing, LP gas) ARE licensed by the state.')
  lines.push('- Real signal of a good VT contractor: referrals + verified insurance + written contract with milestones.')
  lines.push('')
  lines.push('CORE VETTING STEPS (every project):')
  lines.push('- Verify AG registration if project is over $3,500 (free for contractors; refusing to register is a red flag).')
  lines.push('- Get a Certificate of Insurance directly from the insurer — confirm GL + workers comp.')
  lines.push('- Three references from past 12 months on similar VT projects. Call them.')
  lines.push('- Written contract with scope, milestone payments (not calendar), 3-day right to cancel (VT law).')
  lines.push('- Confirm contractor (not homeowner) pulls the building permit.')
  lines.push('')
  lines.push('LARGER PROJECTS ($10k+):')
  lines.push('- Visit an active jobsite if possible.')
  lines.push('- Identify subs and suppliers in advance; collect lien waivers at final payment.')
  lines.push('- Three bids; cheapest 30% lower than the others is usually a trap, not a bargain.')
  lines.push('')
  lines.push('IMPORTANT: When the user asks about hiring a contractor, do NOT recommend specific companies by name. Speak to the process and the red flags.')
  return lines.join('\n')
}
