import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/bathroom-remodeling-middlebury-vt'

const content = {
    "slug": "bathroom-remodeling-middlebury-vt",
    "serviceLabel": "Bathroom remodeling",
    "townName": "Middlebury",
    "townSlug": "middlebury-vt",
    "county": "Addison County",
    "metaTitle": "Bathroom remodeling in Middlebury, VT — costs, rebates, what to know",
    "metaDescription": "What bathroom remodel actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    "h1": "Bathroom remodeling in Middlebury, VT — costs, contractors, rebates",
    "leadParagraph": "College town. Middlebury College drives both the rental market and contractor pipeline. Student rental conversion rules tightened in 2025 — verify current cap with town zoning before assuming rental yield math. Bathroom remodeling in Middlebury runs at 1.00× statewide median. Get bids that know the Middlebury reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Bathroom remodeling costs in Middlebury",
        "body": "Middlebury runs 1.00× of statewide median for bathroom remodel work. Mid-2026 numbers, with Middlebury adjustments.\n\n**Mid-range bathroom remodel** — $12,000-28,000 statewide median (new tile, vanity, fixtures, updated plumbing).\n**Full bathroom remodel** — $25,000-55,000 statewide median (full gut, premium finishes, shower-tub conversions, layout changes).\n\nIn Middlebury, multiply by 1.00×.\n\nThe cost driver in Middlebury is the contractor pool size. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for bathroom remodel in Middlebury",
        "body": "GMP territory. $2,000 per condenser income-eligible bonus applies. Stack with EVT $2,200 ducted heat pump, $400 fuel-switching, $500 panel upgrade.\n\nBathroom remodels rarely qualify for major rebates on their own, but pairing with a heat pump water heater install ($600 EVT rebate) often makes sense if the existing tank is end-of-life.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Middlebury (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule bathroom remodel in Vermont",
        "body": "Bathroom remodels work year-round. Vermont contractors prefer winter scheduling — the fixtures arrive on time, the tile setters aren't competing with summer exterior work, and the home is at heating-bill-attention so weatherization upsells often land."
      },
      {
        "h2": "Vetting a bathroom remodel contractor in Middlebury",
        "body": "Plumbing work in Vermont requires a Vermont-licensed plumber (state-level Department of Public Safety license). Verify the bid lists the licensed plumber by name. The contractor's general liability insurance must extend to subcontractors.\n\n**Vermont-specific:** Middlebury has narrower contractor density. Start the search 4-5 months before you want work to begin, not 4-5 weeks. The town's permit log is a public record and a better contractor reference than online reviews."
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
      "kitchen-remodeling-middlebury-vt",
      "electrical-contractors-middlebury-vt",
      "bathroom-remodeling-vermont",
      "middlebury-vt"
    ],
    "samplePropertySlug": "main-street-middlebury-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Bathroom remodeling in Middlebury, VT — costs, rebates, what to know",
  description: "What bathroom remodel actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Bathroom remodeling in Middlebury, VT — costs, rebates, what to know",
    description: "What bathroom remodel actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
