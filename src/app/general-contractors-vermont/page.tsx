import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/general-contractors-vermont'

const content = {
    "slug": "general-contractors-vermont",
    "serviceLabel": "General contractors",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Vermont General Contractors 2026: Verification + Pre-Hire Test",
    "metaDescription": "Verified Vermont GC list + Secretary of State registry check + the 5-question pre-hire test that flags red flags before signing. Free.",
    "h1": "General contractor in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont general contractor project costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont general contractor project costs by tier",
        "body": "Vermont breaks into four cost tiers for general contractor project work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**Statewide median** for general contractor project varies widely by scope. Get three written bids before assuming a budget; the variance between bids tells you where the scope ambiguity is.\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont general contractor project",
        "body": "General contractor projects often pull together rebates from multiple programs — EVT weatherization ($2,200 ducted heat pump, $475 ductless head, 75% weatherization), federal 25D for solar+battery, and Vermont Net Metering. The GC coordinates the paperwork; verify each rebate is specifically named in the bid before signing.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule general contractor project in Vermont",
        "body": "Vermont GC projects span mud season, summer, and pre-winter. Realistic project timelines stretch 6-18 months for major scope. Book 4-6 months ahead of intended start; sign by January for summer-fall starts."
      },
      {
        "h2": "Vetting a Vermont general contractor project contractor",
        "body": "GCs are the highest-stakes Vermont contractor hire. Vermont AG registration ($3,500+ threshold), 9 V.S.A. § 4006 compliant contract, certificate of liability insurance ($1M minimum), workers comp if employees. For projects $10k+, request all subcontractor and material supplier names BEFORE work starts to defend against mechanic's lien exposure under 9 V.S.A. Chapter 51.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium",
      "vt-tier-burlington-metro",
      "vt-tier-rural-discount"
    ],
    "relatedGuideSlugs": [
      "how-to-find-contractor-vermont",
      "vermont-contractor-red-flags",
      "what-to-ask-contractor-before-hiring",
      "vermont-renovation-permit-guide",
      "vermont-rebate-stack-2026"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-vermont",
      "home-additions-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Vermont General Contractors 2026: Verification + Pre-Hire Test",
  description: "Verified Vermont GC list + Secretary of State registry check + the 5-question pre-hire test that flags red flags before signing. Free.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Vermont General Contractors 2026: Verification + Pre-Hire Test",
    description: "Verified Vermont GC list + Secretary of State registry check + the 5-question pre-hire test that flags red flags before signing. Free.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
