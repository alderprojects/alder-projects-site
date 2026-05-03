import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/kitchen-remodeling-vermont'

const content = {
    "slug": "kitchen-remodeling-vermont",
    "serviceLabel": "Kitchen remodeling",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Kitchen remodeling in Vermont — what it actually costs in 2026",
    "metaDescription": "What kitchen remodel actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    "h1": "Kitchen remodeling in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont kitchen remodel costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont kitchen remodel costs by tier",
        "body": "Vermont breaks into four cost tiers for kitchen remodel work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**Mid-range kitchen remodel** — $35,000-65,000 statewide median (semi-custom cabinets, quartz/granite counters, new appliances, updated electrical).\n**Full gut kitchen renovation** — $60,000-120,000+ statewide median (custom cabinetry, premium stone, professional appliances, full electrical and plumbing rough-in).\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont kitchen remodel",
        "body": "Pair with a heat pump install during the remodel and EVT's $2,200 ducted rebate plus the $400 fuel-switching bonus stack on top of the kitchen scope. Most Vermont kitchen remodels with electrical service upgrades qualify for the EVT $500 panel rebate.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule kitchen remodel in Vermont",
        "body": "Vermont kitchen remodels run best in late winter through spring. Mud season is fine for interior work — the contractors aren't tied up on exterior projects. Avoid the August-October window if the home will be occupied during demolition; that's when interior crews are stretched thinnest."
      },
      {
        "h2": "Vetting a Vermont kitchen remodel contractor",
        "body": "Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and a 3-day right to cancel. Missing items = unenforceable against you.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "vt-cost-kitchen-mid",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium",
      "vt-tier-burlington-metro",
      "vt-tier-rural-discount",
      "vt-cost-kitchen-full-gut"
    ],
    "relatedGuideSlugs": [
      "how-much-does-kitchen-remodel-cost-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags",
      "vermont-rebate-stack-2026"
    ],
    "relatedServiceSlugs": [
      "bathroom-remodeling-vermont",
      "electrical-contractors-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Kitchen remodeling in Vermont — what it actually costs in 2026",
  description: "What kitchen remodel actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Kitchen remodeling in Vermont — what it actually costs in 2026",
    description: "What kitchen remodel actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
