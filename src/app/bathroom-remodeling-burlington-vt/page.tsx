import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/bathroom-remodeling-burlington-vt'

const content = {
    "slug": "bathroom-remodeling-burlington-vt",
    "serviceLabel": "Bathroom remodeling",
    "townName": "Burlington",
    "townSlug": "burlington-vt",
    "county": "Chittenden County",
    "metaTitle": "Bathroom remodeling in Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What bathroom remodel actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    "h1": "Bathroom remodeling in Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods. Bathroom remodeling in Burlington runs at 1.10-1.20× statewide median. Get bids that know the Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Bathroom remodeling costs in Burlington",
        "body": "Burlington runs 1.10-1.20× of statewide median for bathroom remodel work. Mid-2026 numbers, with Burlington adjustments.\n\n**Mid-range bathroom remodel** — $12,000-28,000 statewide median (new tile, vanity, fixtures, updated plumbing).\n**Full bathroom remodel** — $25,000-55,000 statewide median (full gut, premium finishes, shower-tub conversions, layout changes).\n\nIn Burlington, multiply by 1.10-1.20×.\n\nThe cost driver in Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for bathroom remodel in Burlington",
        "body": "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.\n\nBathroom remodels rarely qualify for major rebates on their own, but pairing with a heat pump water heater install ($600 EVT rebate) often makes sense if the existing tank is end-of-life.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Burlington (Burlington Electric Department (BED)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule bathroom remodel in Vermont",
        "body": "Bathroom remodels work year-round. Vermont contractors prefer winter scheduling — the fixtures arrive on time, the tile setters aren't competing with summer exterior work, and the home is at heating-bill-attention so weatherization upsells often land."
      },
      {
        "h2": "Vetting a bathroom remodel contractor in Burlington",
        "body": "Plumbing work in Vermont requires a Vermont-licensed plumber (state-level Department of Public Safety license). Verify the bid lists the licensed plumber by name. The contractor's general liability insurance must extend to subcontractors.\n\n**Vermont-specific:** Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Burlington (most expensive, often)."
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
      "kitchen-remodeling-burlington-vt",
      "electrical-contractors-burlington-vt",
      "bathroom-remodeling-vermont",
      "burlington-vt"
    ],
    "samplePropertySlug": "main-street-burlington-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Bathroom remodeling in Burlington, VT — costs, rebates, what to know",
  description: "What bathroom remodel actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Bathroom remodeling in Burlington, VT — costs, rebates, what to know",
    description: "What bathroom remodel actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
