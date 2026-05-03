import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/bathroom-remodeling-south-burlington-vt'

const content = {
    "slug": "bathroom-remodeling-south-burlington-vt",
    "serviceLabel": "Bathroom remodeling",
    "townName": "South Burlington",
    "townSlug": null,
    "county": "Chittenden County",
    "metaTitle": "Bathroom remodeling in South Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What bathroom remodel actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
    "h1": "Bathroom remodeling in South Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Chittenden County metro tier. Newer housing stock than Burlington proper means fewer surprise electrical upgrades. GMP territory — full rebate stack applies. Bathroom remodeling in South Burlington runs at 1.05-1.15× statewide median. Get bids that know the South Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Bathroom remodeling costs in South Burlington",
        "body": "South Burlington runs 1.05-1.15× of statewide median for bathroom remodel work. Mid-2026 numbers, with South Burlington adjustments.\n\n**Mid-range bathroom remodel** — $12,000-28,000 statewide median (new tile, vanity, fixtures, updated plumbing).\n**Full bathroom remodel** — $25,000-55,000 statewide median (full gut, premium finishes, shower-tub conversions, layout changes).\n\nIn South Burlington, multiply by 1.05-1.15×.\n\nThe cost driver in South Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for bathroom remodel in South Burlington",
        "body": "GMP territory. The $2,000 per condenser income-eligible heat pump bonus applies (households at or below 80% AMI). Stack with EVT $2,200 ducted, $400 fuel-switching, $500 panel upgrade rebate.\n\nBathroom remodels rarely qualify for major rebates on their own, but pairing with a heat pump water heater install ($600 EVT rebate) often makes sense if the existing tank is end-of-life.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to South Burlington (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule bathroom remodel in Vermont",
        "body": "Bathroom remodels work year-round. Vermont contractors prefer winter scheduling — the fixtures arrive on time, the tile setters aren't competing with summer exterior work, and the home is at heating-bill-attention so weatherization upsells often land."
      },
      {
        "h2": "Vetting a bathroom remodel contractor in South Burlington",
        "body": "Plumbing work in Vermont requires a Vermont-licensed plumber (state-level Department of Public Safety license). Verify the bid lists the licensed plumber by name. The contractor's general liability insurance must extend to subcontractors.\n\n**Vermont-specific:** South Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for South Burlington (most expensive, often)."
      }
    ],
    "factIds": [
      "vt-cost-bathroom-mid",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold"
    ],
    "relatedGuideSlugs": [
      "how-long-does-bathroom-remodel-take-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-south-burlington-vt",
      "electrical-contractors-south-burlington-vt",
      "bathroom-remodeling-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Bathroom remodeling in South Burlington, VT — costs, rebates, what to know",
  description: "What bathroom remodel actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Bathroom remodeling in South Burlington, VT — costs, rebates, what to know",
    description: "What bathroom remodel actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
