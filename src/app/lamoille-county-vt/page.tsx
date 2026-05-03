import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/lamoille-county-vt'

const content = {
    "slug": "lamoille-county-vt",
    "serviceLabel": "Lamoille County renovation",
    "townName": "Lamoille County",
    "townSlug": null,
    "county": "Lamoille County",
    "metaTitle": "Lamoille County, VT property guide — costs, contractors, rebates",
    "metaDescription": "What renovation, weatherization, and contractor work actually costs in Lamoille County, Vermont in 2026. Built for Lamoille County homeowners.",
    "h1": "Lamoille County, Vermont — costs, contractors, what to know.",
    "leadParagraph": "Lamoille County is Stowe's home county. The resort-tier pricing dominates project economics here — labor scarcity and design review prep time are real cost drivers. Most Lamoille County towns are on VPPSA member utilities (Stowe Electric, Hyde Park Electric, Morrisville Water & Light), not GMP. The contractor reality varies sharply across Lamoille County — get bids that know your specific town's pricing tier, not a generic county-level number.",
    "sections": [
      {
        "h2": "What Lamoille County feels like for renovation work",
        "body": "Lamoille County is Stowe's home county. The resort-tier pricing dominates project economics here — labor scarcity and design review prep time are real cost drivers. Most Lamoille County towns are on VPPSA member utilities (Stowe Electric, Hyde Park Electric, Morrisville Water & Light), not GMP.\n\nLamoille County's strongest crews work mostly in Stowe at resort-tier rates. For non-Stowe projects in Hyde Park, Morristown, or Johnson, expect to draw from a smaller pool. The town clerk's permit log is the best contractor reference for non-Stowe work."
      },
      {
        "h2": "Project costs in Lamoille County",
        "body": "Lamoille County runs at the 1.30-1.45× statewide-median tier for most renovation categories. Specific ranges (verified mid-2026):\n\n**Mid-range kitchen remodel** — $35,000-65,000 statewide median (apply tier multiplier).\n**Bathroom remodel** — $12,000-28,000 statewide median.\n**Roofing replacement** — $8,000-20,000 asphalt, $20,000-40,000 standing seam metal.\n**Heat pump install** — $11,000-22,000 ducted; $3,500-5,500 single-zone ductless.\n**Whole-home weatherization** — $4,000-18,000 typical; EVT 75% rebate (standard tier) brings out-of-pocket to $1,000-4,500.\n\n**Trap:** the bid that quotes \"Lamoille County\" pricing without specifying which town. The variance between resort-tier and rural Lamoille County towns is real money. Confirm pricing tier with each bidder."
      },
      {
        "h2": "Rebates that apply across Lamoille County",
        "body": "EVT statewide rebates apply equally regardless of town: $2,200 ducted heat pump, $475 ductless head, $400 fuel-switching bonus, $500 electrical service upgrade tied to electrification, $600 heat pump water heater. Weatherization runs 75% of project cost (standard tier) or 90% income-eligible.\n\n**Vermont-specific:** the utility-side incentive layer differs by town within Lamoille County. Most Lamoille County towns are on Green Mountain Power (GMP) territory with the $2,000 per condenser income-eligible heat pump bonus. Some towns are on VPPSA member utilities with a $1,000 bonus instead. Verify your specific utility before assuming the stack.\n\nThe federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law. The 2026 stack is leaner than 2024-2025 but still strong for combined heat-pump + weatherization projects."
      },
      {
        "h2": "Vetting a Lamoille County contractor",
        "body": "Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel.\n\nFor projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.\n\n**Trap:** bids that come in dramatically lower than the others. Cheap Lamoille County bids usually skip supplementary scope (electrical service upgrade, plumbing modernization, design review prep) that surfaces as change orders. The cheapest bid often costs the most by the time the project finishes."
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
      "vt-mechanics-lien-statute",
      "vt-tier-resort-premium"
    ],
    "relatedGuideSlugs": [
      "heat-pump-rebates-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags",
      "vermont-rebate-stack-2026"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-stowe-vt",
      "bathroom-remodeling-stowe-vt",
      "roofing-stowe-vt",
      "deck-builders-stowe-vt",
      "stowe-vt"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Lamoille County, VT property guide — costs, contractors, rebates",
  description: "What renovation, weatherization, and contractor work actually costs in Lamoille County, Vermont in 2026. Built for Lamoille County homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Lamoille County, VT property guide — costs, contractors, rebates",
    description: "What renovation, weatherization, and contractor work actually costs in Lamoille County, Vermont in 2026. Built for Lamoille County homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
