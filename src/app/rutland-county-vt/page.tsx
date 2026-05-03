import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/rutland-county-vt'

const content = {
    "slug": "rutland-county-vt",
    "serviceLabel": "Rutland County renovation",
    "townName": "Rutland County",
    "townSlug": null,
    "county": "Rutland County",
    "metaTitle": "Rutland County, VT property guide — costs, contractors, rebates",
    "metaDescription": "What renovation, weatherization, and contractor work actually costs in Rutland County, Vermont in 2026. Built for Rutland County homeowners.",
    "h1": "Rutland County, Vermont — costs, contractors, what to know.",
    "leadParagraph": "Rutland County mixes the Rutland city small-city tier with Killington-area resort pricing. Castleton's Lake Bomoseen properties trigger Vermont shoreland buffer rules. The county's older housing stock makes weatherization payback fast. The contractor reality varies sharply across Rutland County — get bids that know your specific town's pricing tier, not a generic county-level number.",
    "sections": [
      {
        "h2": "What Rutland County feels like for renovation work",
        "body": "Rutland County mixes the Rutland city small-city tier with Killington-area resort pricing. Castleton's Lake Bomoseen properties trigger Vermont shoreland buffer rules. The county's older housing stock makes weatherization payback fast.\n\nRutland County has decent contractor density centered on Rutland city. Killington-area work runs at near resort-premium rates. Lake Bomoseen and Lake St. Catherine projects need shoreland-experienced contractors."
      },
      {
        "h2": "Project costs in Rutland County",
        "body": "Rutland County runs at the 1.00× statewide-median tier for most renovation categories. Specific ranges (verified mid-2026):\n\n**Mid-range kitchen remodel** — $35,000-65,000 statewide median (apply tier multiplier).\n**Bathroom remodel** — $12,000-28,000 statewide median.\n**Roofing replacement** — $8,000-20,000 asphalt, $20,000-40,000 standing seam metal.\n**Heat pump install** — $11,000-22,000 ducted; $3,500-5,500 single-zone ductless.\n**Whole-home weatherization** — $4,000-18,000 typical; EVT 75% rebate (standard tier) brings out-of-pocket to $1,000-4,500.\n\n**Trap:** the bid that quotes \"Rutland County\" pricing without specifying which town. The variance between resort-tier and rural Rutland County towns is real money. Confirm pricing tier with each bidder."
      },
      {
        "h2": "Rebates that apply across Rutland County",
        "body": "EVT statewide rebates apply equally regardless of town: $2,200 ducted heat pump, $475 ductless head, $400 fuel-switching bonus, $500 electrical service upgrade tied to electrification, $600 heat pump water heater. Weatherization runs 75% of project cost (standard tier) or 90% income-eligible.\n\n**Vermont-specific:** the utility-side incentive layer differs by town within Rutland County. Most Rutland County towns are on Green Mountain Power (GMP) territory with the $2,000 per condenser income-eligible heat pump bonus. Some towns are on VPPSA member utilities with a $1,000 bonus instead. Verify your specific utility before assuming the stack.\n\nThe federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law. The 2026 stack is leaner than 2024-2025 but still strong for combined heat-pump + weatherization projects."
      },
      {
        "h2": "Vetting a Rutland County contractor",
        "body": "Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel.\n\nFor projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.\n\n**Trap:** bids that come in dramatically lower than the others. Cheap Rutland County bids usually skip supplementary scope (electrical service upgrade, plumbing modernization, design review prep) that surfaces as change orders. The cheapest bid often costs the most by the time the project finishes."
      }
    ],
    "factIds": [
      "evt-ducted-heat-pump-rebate",
      "evt-ductless-heat-pump-rebate",
      "evt-fuel-switching-bonus",
      "evt-weatherization-standard-tier",
      "gmp-heat-pump-income-bonus",
      "federal-25c-expired",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-mechanics-lien-statute"
    ],
    "relatedGuideSlugs": [
      "heat-pump-rebates-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags",
      "vermont-rebate-stack-2026"
    ],
    "relatedServiceSlugs": [
      "roofing-rutland-vt",
      "kitchen-remodeling-rutland-vt",
      "window-replacement-rutland-vt"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Rutland County, VT property guide — costs, contractors, rebates",
  description: "What renovation, weatherization, and contractor work actually costs in Rutland County, Vermont in 2026. Built for Rutland County homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Rutland County, VT property guide — costs, contractors, rebates",
    description: "What renovation, weatherization, and contractor work actually costs in Rutland County, Vermont in 2026. Built for Rutland County homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
