import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/bathroom-remodeling-vermont'

const content = {
    "slug": "bathroom-remodeling-vermont",
    "serviceLabel": "Bathroom remodeling",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Bathroom remodeling in Vermont — what it actually costs in 2026",
    "metaDescription": "What bathroom remodel actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    "h1": "Bathroom remodeling in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont bathroom remodel costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont bathroom remodel costs by tier",
        "body": "Vermont breaks into four cost tiers for bathroom remodel work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**Mid-range bathroom remodel** — $12,000-28,000 statewide median (new tile, vanity, fixtures, updated plumbing).\n**Full bathroom remodel** — $25,000-55,000 statewide median (full gut, premium finishes, shower-tub conversions, layout changes).\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont bathroom remodel",
        "body": "Bathroom remodels rarely qualify for major rebates on their own, but pairing with a heat pump water heater install ($600 EVT rebate) often makes sense if the existing tank is end-of-life.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule bathroom remodel in Vermont",
        "body": "Bathroom remodels work year-round. Vermont contractors prefer winter scheduling — the fixtures arrive on time, the tile setters aren't competing with summer exterior work, and the home is at heating-bill-attention so weatherization upsells often land."
      },
      {
        "h2": "Vetting a Vermont bathroom remodel contractor",
        "body": "Plumbing work in Vermont requires a Vermont-licensed plumber (state-level Department of Public Safety license). Verify the bid lists the licensed plumber by name. The contractor's general liability insurance must extend to subcontractors.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "vt-cost-bathroom-mid",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium",
      "vt-tier-burlington-metro",
      "vt-tier-rural-discount"
    ],
    "relatedGuideSlugs": [
      "how-long-does-bathroom-remodel-take-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-vermont",
      "electrical-contractors-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Bathroom remodeling in Vermont — what it actually costs in 2026",
  description: "What bathroom remodel actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Bathroom remodeling in Vermont — what it actually costs in 2026",
    description: "What bathroom remodel actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
