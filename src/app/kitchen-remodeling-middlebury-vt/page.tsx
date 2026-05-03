import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/kitchen-remodeling-middlebury-vt'

const content = {
    "slug": "kitchen-remodeling-middlebury-vt",
    "serviceLabel": "Kitchen remodeling",
    "townName": "Middlebury",
    "townSlug": "middlebury-vt",
    "county": "Addison County",
    "metaTitle": "Kitchen remodeling in Middlebury, VT — costs, rebates, what to know",
    "metaDescription": "What kitchen remodel actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    "h1": "Kitchen remodeling in Middlebury, VT — costs, contractors, rebates",
    "leadParagraph": "College town. Middlebury College drives both the rental market and contractor pipeline. Student rental conversion rules tightened in 2025 — verify current cap with town zoning before assuming rental yield math. Kitchen remodeling in Middlebury runs at 1.00× statewide median. Get bids that know the Middlebury reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Kitchen remodeling costs in Middlebury",
        "body": "Middlebury runs 1.00× of statewide median for kitchen remodel work. Mid-2026 numbers, with Middlebury adjustments.\n\n**Mid-range kitchen remodel** — $35,000-65,000 statewide median (semi-custom cabinets, quartz/granite counters, new appliances, updated electrical).\n**Full gut kitchen renovation** — $60,000-120,000+ statewide median (custom cabinetry, premium stone, professional appliances, full electrical and plumbing rough-in).\n\nIn Middlebury, multiply by 1.00×.\n\nThe cost driver in Middlebury is the contractor pool size. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for kitchen remodel in Middlebury",
        "body": "GMP territory. $2,000 per condenser income-eligible bonus applies. Stack with EVT $2,200 ducted heat pump, $400 fuel-switching, $500 panel upgrade.\n\nPair with a heat pump install during the remodel and EVT's $2,200 ducted rebate plus the $400 fuel-switching bonus stack on top of the kitchen scope. Most Vermont kitchen remodels with electrical service upgrades qualify for the EVT $500 panel rebate.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Middlebury (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule kitchen remodel in Vermont",
        "body": "Vermont kitchen remodels run best in late winter through spring. Mud season is fine for interior work — the contractors aren't tied up on exterior projects. Avoid the August-October window if the home will be occupied during demolition; that's when interior crews are stretched thinnest."
      },
      {
        "h2": "Vetting a kitchen remodel contractor in Middlebury",
        "body": "Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and a 3-day right to cancel. Missing items = unenforceable against you.\n\n**Vermont-specific:** Middlebury has narrower contractor density. Start the search 4-5 months before you want work to begin, not 4-5 weeks. The town's permit log is a public record and a better contractor reference than online reviews."
      }
    ],
    "factIds": [
      "vt-cost-kitchen-mid",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-cost-kitchen-full-gut"
    ],
    "relatedGuideSlugs": [
      "how-much-does-kitchen-remodel-cost-vermont",
      "how-to-find-contractor-vermont",
      "vermont-renovation-permit-guide",
      "vermont-contractor-red-flags",
      "vermont-rebate-stack-2026"
    ],
    "relatedServiceSlugs": [
      "bathroom-remodeling-middlebury-vt",
      "electrical-contractors-middlebury-vt",
      "kitchen-remodeling-vermont",
      "middlebury-vt"
    ],
    "samplePropertySlug": "main-street-middlebury-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Kitchen remodeling in Middlebury, VT — costs, rebates, what to know",
  description: "What kitchen remodel actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Kitchen remodeling in Middlebury, VT — costs, rebates, what to know",
    description: "What kitchen remodel actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
