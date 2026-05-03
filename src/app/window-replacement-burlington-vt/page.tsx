import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/window-replacement-burlington-vt'

const content = {
    "slug": "window-replacement-burlington-vt",
    "serviceLabel": "Window replacement",
    "townName": "Burlington",
    "townSlug": "burlington-vt",
    "county": "Chittenden County",
    "metaTitle": "Window replacement in Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What window replacement actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    "h1": "Window replacement in Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods. Window replacement in Burlington runs at 1.10-1.20× statewide median. Get bids that know the Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Window replacement costs in Burlington",
        "body": "Burlington runs 1.10-1.20× of statewide median for window replacement work. Mid-2026 numbers, with Burlington adjustments.\n\n**12-window replacement project** — $12,000-28,000 statewide median (modern double-pane vinyl or fiberglass; historic district approval adds time but rarely cost).\n\nIn Burlington, multiply by 1.10-1.20×.\n\nThe cost driver in Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for window replacement in Burlington",
        "body": "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.\n\nThe federal Section 25C credit (which used to cover windows at 30% up to $1,200/year) expired December 31, 2025 and is not in current law. Window replacements in 2026 don't have a federal credit available. Stack value comes from EVT weatherization (75% standard tier, 90% income-eligible) when the project includes air-sealing around the window openings.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Burlington (Burlington Electric Department (BED)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule window replacement in Vermont",
        "body": "Window replacement work runs year-round but installs slow in deep winter (above 40°F days needed for proper caulking and sealant cure). Spring through fall is the sweet spot. Historic-district properties need design review approval — add 4-8 weeks for that step."
      },
      {
        "h2": "Vetting a window replacement contractor in Burlington",
        "body": "Vermont contractor registration with the AG required for any project $3,500+. Modern double-pane vinyl or fiberglass windows can match historic profiles for properties in design review districts (Stowe Village, Woodstock, Burlington Hill Section). Verify the contractor has done historic-district installs if applicable.\n\n**Vermont-specific:** Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Burlington (most expensive, often)."
      }
    ],
    "factIds": [
      "vt-cost-windows-replacement",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold"
    ],
    "relatedGuideSlugs": [
      "vermont-weatherization-evt-rebate",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "roofing-burlington-vt",
      "painting-contractors-burlington-vt",
      "window-replacement-vermont",
      "burlington-vt"
    ],
    "samplePropertySlug": "main-street-burlington-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Window replacement in Burlington, VT — costs, rebates, what to know",
  description: "What window replacement actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Window replacement in Burlington, VT — costs, rebates, what to know",
    description: "What window replacement actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
