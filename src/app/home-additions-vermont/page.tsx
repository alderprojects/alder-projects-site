import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/home-additions-vermont'

const content = {
    "slug": "home-additions-vermont",
    "serviceLabel": "Home additions",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Home addition / ADU in Vermont — what it actually costs in 2026",
    "metaDescription": "What home addition actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    "h1": "Home addition / ADU in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont home addition costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont home addition costs by tier",
        "body": "Vermont breaks into four cost tiers for home addition work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**ADU build, 700-900 sq ft** — $85,000-175,000 statewide median (detached, fully built including foundation, framing, roof, exterior, full interior).\n**Plus** — $300-1,500 Vermont DEC wastewater permit, $500-1,500 septic engineer evaluation, $3,000-7,500 electrical service upgrade if needed.\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont home addition",
        "body": "Vermont's Act 47 (effective July 2024) makes ADUs by-right statewide, overriding most town size caps. If the addition adds bedroom capacity, a Vermont DEC wastewater permit is required ($300-1,500 + $500-1,500 for the licensed septic engineer). The 50% substantial improvement rule applies in FEMA flood zones.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule home addition in Vermont",
        "body": "Home additions run 12-18 months from start to move-in including permit time. The wastewater permit process alone is 4-12 weeks. Foundation work needs above-freezing days, so ground-up additions typically start in mid-May after mud season. Garage conversions can start any time."
      },
      {
        "h2": "Vetting a Vermont home addition contractor",
        "body": "Major additions are the highest-stakes Vermont contractor hire. Verify Vermont AG registration ($3,500+ threshold), 9 V.S.A. § 4006-compliant written contract, and certificate of liability insurance ($1M minimum). For projects $10k+, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "vt-cost-adu",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium",
      "vt-tier-burlington-metro",
      "vt-tier-rural-discount"
    ],
    "relatedGuideSlugs": [
      "vermont-adu-permit-cost-2026",
      "can-i-add-bedroom-vermont-lake-house",
      "vermont-septic-what-to-know",
      "how-to-find-contractor-vermont",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-vermont",
      "bathroom-remodeling-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Home addition / ADU in Vermont — what it actually costs in 2026",
  description: "What home addition actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Home addition / ADU in Vermont — what it actually costs in 2026",
    description: "What home addition actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
