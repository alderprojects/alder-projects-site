import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/home-additions-south-burlington-vt'

const content = {
    "slug": "home-additions-south-burlington-vt",
    "serviceLabel": "Home additions",
    "townName": "South Burlington",
    "townSlug": null,
    "county": "Chittenden County",
    "metaTitle": "Home addition / ADU in South Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What home addition actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
    "h1": "Home addition / ADU in South Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Chittenden County metro tier. Newer housing stock than Burlington proper means fewer surprise electrical upgrades. GMP territory — full rebate stack applies. Home addition / ADU in South Burlington runs at 1.05-1.15× statewide median. Get bids that know the South Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Home addition / ADU costs in South Burlington",
        "body": "South Burlington runs 1.05-1.15× of statewide median for home addition work. Mid-2026 numbers, with South Burlington adjustments.\n\n**ADU build, 700-900 sq ft** — $85,000-175,000 statewide median (detached, fully built including foundation, framing, roof, exterior, full interior).\n**Plus** — $300-1,500 Vermont DEC wastewater permit, $500-1,500 septic engineer evaluation, $3,000-7,500 electrical service upgrade if needed.\n\nIn South Burlington, multiply by 1.05-1.15×.\n\nThe cost driver in South Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for home addition in South Burlington",
        "body": "GMP territory. The $2,000 per condenser income-eligible heat pump bonus applies (households at or below 80% AMI). Stack with EVT $2,200 ducted, $400 fuel-switching, $500 panel upgrade rebate.\n\nVermont's Act 47 (effective July 2024) makes ADUs by-right statewide, overriding most town size caps. If the addition adds bedroom capacity, a Vermont DEC wastewater permit is required ($300-1,500 + $500-1,500 for the licensed septic engineer). The 50% substantial improvement rule applies in FEMA flood zones.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to South Burlington (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule home addition in Vermont",
        "body": "Home additions run 12-18 months from start to move-in including permit time. The wastewater permit process alone is 4-12 weeks. Foundation work needs above-freezing days, so ground-up additions typically start in mid-May after mud season. Garage conversions can start any time."
      },
      {
        "h2": "Vetting a home addition contractor in South Burlington",
        "body": "Major additions are the highest-stakes Vermont contractor hire. Verify Vermont AG registration ($3,500+ threshold), 9 V.S.A. § 4006-compliant written contract, and certificate of liability insurance ($1M minimum). For projects $10k+, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.\n\n**Vermont-specific:** South Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for South Burlington (most expensive, often)."
      }
    ],
    "factIds": [
      "vt-cost-adu",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold"
    ],
    "relatedGuideSlugs": [
      "vermont-adu-permit-cost-2026",
      "can-i-add-bedroom-vermont-lake-house",
      "vermont-septic-what-to-know",
      "how-to-find-contractor-vermont",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-south-burlington-vt",
      "bathroom-remodeling-south-burlington-vt",
      "home-additions-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Home addition / ADU in South Burlington, VT — costs, rebates, what to know",
  description: "What home addition actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Home addition / ADU in South Burlington, VT — costs, rebates, what to know",
    description: "What home addition actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
