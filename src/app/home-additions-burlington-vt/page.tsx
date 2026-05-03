import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/home-additions-burlington-vt'

const content = {
    "slug": "home-additions-burlington-vt",
    "serviceLabel": "Home additions",
    "townName": "Burlington",
    "townSlug": "burlington-vt",
    "county": "Chittenden County",
    "metaTitle": "Home addition / ADU in Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What home addition actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    "h1": "Home addition / ADU in Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods. Home addition / ADU in Burlington runs at 1.10-1.20× statewide median. Get bids that know the Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Home addition / ADU costs in Burlington",
        "body": "Burlington runs 1.10-1.20× of statewide median for home addition work. Mid-2026 numbers, with Burlington adjustments.\n\n**ADU build, 700-900 sq ft** — $85,000-175,000 statewide median (detached, fully built including foundation, framing, roof, exterior, full interior).\n**Plus** — $300-1,500 Vermont DEC wastewater permit, $500-1,500 septic engineer evaluation, $3,000-7,500 electrical service upgrade if needed.\n\nIn Burlington, multiply by 1.10-1.20×.\n\nThe cost driver in Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for home addition in Burlington",
        "body": "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.\n\nVermont's Act 47 (effective July 2024) makes ADUs by-right statewide, overriding most town size caps. If the addition adds bedroom capacity, a Vermont DEC wastewater permit is required ($300-1,500 + $500-1,500 for the licensed septic engineer). The 50% substantial improvement rule applies in FEMA flood zones.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Burlington (Burlington Electric Department (BED)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule home addition in Vermont",
        "body": "Home additions run 12-18 months from start to move-in including permit time. The wastewater permit process alone is 4-12 weeks. Foundation work needs above-freezing days, so ground-up additions typically start in mid-May after mud season. Garage conversions can start any time."
      },
      {
        "h2": "Vetting a home addition contractor in Burlington",
        "body": "Major additions are the highest-stakes Vermont contractor hire. Verify Vermont AG registration ($3,500+ threshold), 9 V.S.A. § 4006-compliant written contract, and certificate of liability insurance ($1M minimum). For projects $10k+, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.\n\n**Vermont-specific:** Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Burlington (most expensive, often)."
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
      "kitchen-remodeling-burlington-vt",
      "bathroom-remodeling-burlington-vt",
      "home-additions-vermont",
      "burlington-vt"
    ],
    "samplePropertySlug": "main-street-burlington-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Home addition / ADU in Burlington, VT — costs, rebates, what to know",
  description: "What home addition actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Home addition / ADU in Burlington, VT — costs, rebates, what to know",
    description: "What home addition actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
