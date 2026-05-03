import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/window-replacement-colchester-vt'

const content = {
    "slug": "window-replacement-colchester-vt",
    "serviceLabel": "Window replacement",
    "townName": "Colchester",
    "townSlug": null,
    "county": "Chittenden County",
    "metaTitle": "Window replacement in Colchester, VT — costs, rebates, what to know",
    "metaDescription": "What window replacement actually costs in Colchester, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Colchester homeowners.",
    "h1": "Window replacement in Colchester, VT — costs, contractors, rebates",
    "leadParagraph": "Lake Champlain shoreline drives the project planning conversation. Properties within 250 feet of the lake fall under Vermont's Shoreland Protection Act buffer — clearing, building, or new impervious surface in the buffer requires a state DEC shoreland permit. Window replacement in Colchester runs at 1.00-1.10× statewide median. Get bids that know the Colchester reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Window replacement costs in Colchester",
        "body": "Colchester runs 1.00-1.10× of statewide median for window replacement work. Mid-2026 numbers, with Colchester adjustments.\n\n**12-window replacement project** — $12,000-28,000 statewide median (modern double-pane vinyl or fiberglass; historic district approval adds time but rarely cost).\n\nIn Colchester, multiply by 1.00-1.10×.\n\nThe cost driver in Colchester is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for window replacement in Colchester",
        "body": "GMP territory; standard rebate stack applies. Lake-adjacent properties: factor in the shoreland permit timeline (4-12 weeks) before any exterior project schedule.\n\nThe federal Section 25C credit (which used to cover windows at 30% up to $1,200/year) expired December 31, 2025 and is not in current law. Window replacements in 2026 don't have a federal credit available. Stack value comes from EVT weatherization (75% standard tier, 90% income-eligible) when the project includes air-sealing around the window openings.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Colchester (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule window replacement in Vermont",
        "body": "Window replacement work runs year-round but installs slow in deep winter (above 40°F days needed for proper caulking and sealant cure). Spring through fall is the sweet spot. Historic-district properties need design review approval — add 4-8 weeks for that step."
      },
      {
        "h2": "Vetting a window replacement contractor in Colchester",
        "body": "Vermont contractor registration with the AG required for any project $3,500+. Modern double-pane vinyl or fiberglass windows can match historic profiles for properties in design review districts (Stowe Village, Woodstock, Burlington Hill Section). Verify the contractor has done historic-district installs if applicable.\n\n**Vermont-specific:** Colchester has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Colchester (most expensive, often)."
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
      "roofing-colchester-vt",
      "painting-contractors-colchester-vt",
      "window-replacement-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Window replacement in Colchester, VT — costs, rebates, what to know",
  description: "What window replacement actually costs in Colchester, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Colchester homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Window replacement in Colchester, VT — costs, rebates, what to know",
    description: "What window replacement actually costs in Colchester, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Colchester homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
