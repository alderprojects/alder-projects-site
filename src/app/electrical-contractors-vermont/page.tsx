import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/electrical-contractors-vermont'

const content = {
    "slug": "electrical-contractors-vermont",
    "serviceLabel": "Electrical contractors",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Electrical contractor in Vermont — what it actually costs in 2026",
    "metaDescription": "What electrical work actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    "h1": "Electrical contractor in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont electrical work costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont electrical work costs by tier",
        "body": "Vermont breaks into four cost tiers for electrical work work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**200-amp service upgrade** — $3,500-7,500 statewide median (older Vermont homes with 100-amp service often need this for kitchen, HVAC, or EV-charger circuits).\n**EVT $500 electrical panel rebate** applies if the upgrade is tied to electrification (heat pump, EV charger, HPWH).\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont electrical work",
        "body": "Electrical service upgrades tied to electrification (heat pump, EV charger, heat pump water heater) qualify for the EVT $500 electrical panel rebate. EVT's $200 Level 2 EV charger rebate also stacks. Stand-alone panel upgrades without an electrification project don't qualify.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule electrical work in Vermont",
        "body": "Vermont electrical work runs year-round indoors. Service upgrades that require a meter swap need utility coordination — schedule with your utility (GMP, BED, VPPSA member) before booking the contractor. Electrical permit fees are separate from town building permits."
      },
      {
        "h2": "Vetting a Vermont electrical work contractor",
        "body": "All electrical work must be done by a licensed Vermont electrician (state-level Department of Public Safety license, $50-200 permit). Verify the licensed electrician's name and license number on the bid. Subcontracted electrical work often surfaces in a Vermont mechanic's lien dispute when the GC doesn't pay the electrician.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "evt-electrical-service-upgrade",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium",
      "vt-tier-burlington-metro",
      "vt-tier-rural-discount",
      "evt-ducted-heat-pump-rebate",
      "evt-fuel-switching-bonus",
      "gmp-heat-pump-income-bonus",
      "vppsa-heat-pump-income-bonus"
    ],
    "relatedGuideSlugs": [
      "heat-pump-rebates-vermont",
      "vermont-rebate-stack-2026",
      "vermont-renovation-permit-guide",
      "how-to-find-contractor-vermont"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-vermont",
      "bathroom-remodeling-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Electrical contractor in Vermont — what it actually costs in 2026",
  description: "What electrical work actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Electrical contractor in Vermont — what it actually costs in 2026",
    description: "What electrical work actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
