import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/roofing-vermont'

const content = {
    "slug": "roofing-vermont",
    "serviceLabel": "Roofing",
    "townName": "Vermont",
    "townSlug": null,
    "county": null,
    "metaTitle": "Roofing in Vermont — what it actually costs in 2026",
    "metaDescription": "What roof replacement actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    "h1": "Roofing in Vermont — costs, rebates, contractor reality",
    "leadParagraph": "Vermont roof replacement costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.",
    "sections": [
      {
        "h2": "Vermont roof replacement costs by tier",
        "body": "Vermont breaks into four cost tiers for roof replacement work:\n\n**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.\n\n**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.\n\n**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.\n\n**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.\n\n**Asphalt shingle roof replacement** — $8,000-20,000 statewide median (architectural shingles preferred for Vermont wind/ice loads; 1,500 sq ft ranch in Burlington runs $9,000-13,000).\n**Standing seam metal roof** — $20,000-40,000 statewide median (sheds snow naturally, resists ice dams, 40-70 year lifespan).\n\nIn resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×."
      },
      {
        "h2": "Rebates that apply for Vermont roof replacement",
        "body": "Roofing itself rarely qualifies for rebates, but if you are planning solar in the next 10 years, this is the moment. Vermont solar+battery stacks the federal Section 25D 30% credit plus EVT $0.40/Wh battery incentive plus Net Metering Group 2 — and replacing the roof first avoids $4,000-12,000 in solar removal/reinstall costs later.\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack."
      },
      {
        "h2": "When to schedule roof replacement in Vermont",
        "body": "Vermont roofing season is late April through mid-October. Mud season ends and crews can stage materials; first snow makes most asphalt installs impractical by late October. Booking a roof in May for July is realistic; booking in July for September is risky."
      },
      {
        "h2": "Vetting a Vermont roof replacement contractor",
        "body": "Vermont winters punish roofs differently than other regions — snow load, ice dam pressure, and freeze-thaw cycles. Ask about Vermont-specific experience: ice dam mitigation, ventilation upgrades during reroofs, and snow-load engineering for steeper pitches. The cheaper out-of-state crew that doesn't know Vermont winters costs more long-term.\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51."
      }
    ],
    "factIds": [
      "vt-cost-roof-asphalt",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium",
      "vt-tier-burlington-metro",
      "vt-tier-rural-discount",
      "vt-cost-roof-standing-seam"
    ],
    "relatedGuideSlugs": [
      "how-much-does-roof-replacement-cost-vermont",
      "vermont-solar-battery-stack-2026",
      "how-to-find-contractor-vermont",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "window-replacement-vermont",
      "painting-contractors-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Roofing in Vermont — what it actually costs in 2026",
  description: "What roof replacement actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Roofing in Vermont — what it actually costs in 2026",
    description: "What roof replacement actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
