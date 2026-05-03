import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/plumbing-contractors-vermont'

const content = {
    "slug": "plumbing-contractors-vermont",
    "serviceLabel": "Plumbing",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Plumbing in Vermont — what it actually costs in 2026",
    "metaDescription": "What plumbing work actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    "h1": "Plumbing in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont plumbing work costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont plumbing work costs by tier",
        "body": "Vermont breaks into four cost tiers for plumbing work work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**Statewide median** for plumbing work varies widely by scope. Get three written bids before assuming a budget; the variance between bids tells you where the scope ambiguity is.\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont plumbing work",
        "body": "Plumbing tied to a heat pump water heater install qualifies for the EVT $600 rebate. Septic upgrades trigger Vermont DEC wastewater permit requirements ($300-1,500 in fees + septic engineer evaluation $500-1,500). Most other plumbing work doesn't qualify for major rebates.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule plumbing work in Vermont",
        "body": "Vermont plumbing work runs year-round indoors. Outdoor service work (water main, septic) is mud-season-blocked from March through mid-May and frost-blocked from December through early April. Schedule outdoor scope for late spring through early fall."
      },
      {
        "h2": "Vetting a Vermont plumbing work contractor",
        "body": "Vermont plumbing work requires a Vermont-licensed plumber (state Department of Public Safety license, $50-200 permit). Verify license + certificate of liability insurance. For septic and wastewater work, the licensed septic designer must also be Vermont-credentialed — separate from the plumber.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
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
      "vermont-septic-what-to-know",
      "heat-pump-rebates-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide"
    ],
    "relatedServiceSlugs": [
      "bathroom-remodeling-vermont",
      "kitchen-remodeling-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Plumbing in Vermont — what it actually costs in 2026",
  description: "What plumbing work actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Plumbing in Vermont — what it actually costs in 2026",
    description: "What plumbing work actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
