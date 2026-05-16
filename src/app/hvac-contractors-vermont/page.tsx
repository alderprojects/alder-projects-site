import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/hvac-contractors-vermont'

const content = {
    "slug": "hvac-contractors-vermont",
    "serviceLabel": "HVAC contractors",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Vermont HVAC + Heat Pump Rebates 2026: EVT Stack Up to $3,000",
    "metaDescription": "Real 2026 Vermont heat pump rebate stack. EVT $1,000-3,000. Plus utility adders. What stacks, what does not, what to ask before quoting. Free.",
    "h1": "HVAC contractor in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont HVAC project costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont HVAC project costs by tier",
        "body": "Vermont breaks into four cost tiers for HVAC project work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**Ducted whole-house heat pump install** — $11,000-22,000 statewide median (cold-climate NEEP-listed system).\n**Single-zone ductless mini-split** — $3,500-5,500 statewide median.\n**Multi-zone ductless (2-3 rooms)** — $7,000-12,000 statewide median.\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont HVAC project",
        "body": "Vermont HVAC work centers on heat pump installs. EVT pays $2,200 for ducted, $475 per ductless head, $400 fuel-switching bonus (oil removal), $600 heat pump water heater. GMP customers at or below 80% AMI add $2,000 per condenser; VPPSA customers add $1,000. BED customers have a narrower utility-side incentive layer. The federal Section 25C credit expired Dec 31, 2025.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule HVAC project in Vermont",
        "body": "Heat pump install demand peaks in fall (September-November). The good Vermont installers are fully booked in November for spring work. Book by April for fall installs; book by November for spring-after-mud-season. Calling in October for January is unrealistic — the strong crews are committed."
      },
      {
        "h2": "Vetting a Vermont HVAC project contractor",
        "body": "EVT-participating contractor required for the rebate. The list is at efficiencyvermont.com/find-contractor; verify in writing. Cold-climate experience matters — ask how many NEEP-listed installs they've done in Vermont winters and which models they typically install. Vermont electrical license + AG registration mandatory for any $3,500+ project.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "vt-cost-heat-pump-ducted",
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
      "vermont-heat-pump-rebate-stack-2026",
      "vermont-rebate-stack-2026",
      "vermont-weatherization-evt-rebate",
      "how-to-find-contractor-vermont"
    ],
    "relatedServiceSlugs": [
      "electrical-contractors-vermont",
      "plumbing-contractors-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Vermont HVAC + Heat Pump Rebates 2026: EVT Stack Up to $3,000",
  description: "Real 2026 Vermont heat pump rebate stack. EVT $1,000-3,000. Plus utility adders. What stacks, what does not, what to ask before quoting. Free.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Vermont HVAC + Heat Pump Rebates 2026: EVT Stack Up to $3,000",
    description: "Real 2026 Vermont heat pump rebate stack. EVT $1,000-3,000. Plus utility adders. What stacks, what does not, what to ask before quoting. Free.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
