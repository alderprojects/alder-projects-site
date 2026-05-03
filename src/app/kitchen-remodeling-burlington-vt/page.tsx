import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/kitchen-remodeling-burlington-vt'

const content = {
    "slug": "kitchen-remodeling-burlington-vt",
    "serviceLabel": "Kitchen remodeling",
    "townName": "Burlington",
    "townSlug": "burlington-vt",
    "county": "Chittenden County",
    "metaTitle": "Kitchen remodeling in Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What kitchen remodel actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    "h1": "Kitchen remodeling in Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods. Kitchen remodeling in Burlington runs at 1.10-1.20× statewide median. Get bids that know the Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Kitchen remodeling costs in Burlington",
        "body": "Burlington runs 1.10-1.20× of statewide median for kitchen remodel work. Mid-2026 numbers, with Burlington adjustments.\n\n**Mid-range kitchen remodel** — $35,000-65,000 statewide median (semi-custom cabinets, quartz/granite counters, new appliances, updated electrical).\n**Full gut kitchen renovation** — $60,000-120,000+ statewide median (custom cabinetry, premium stone, professional appliances, full electrical and plumbing rough-in).\n\nIn Burlington, multiply by 1.10-1.20×.\n\nThe cost driver in Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for kitchen remodel in Burlington",
        "body": "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.\n\nPair with a heat pump install during the remodel and EVT's $2,200 ducted rebate plus the $400 fuel-switching bonus stack on top of the kitchen scope. Most Vermont kitchen remodels with electrical service upgrades qualify for the EVT $500 panel rebate.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Burlington (Burlington Electric Department (BED)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule kitchen remodel in Vermont",
        "body": "Vermont kitchen remodels run best in late winter through spring. Mud season is fine for interior work — the contractors aren't tied up on exterior projects. Avoid the August-October window if the home will be occupied during demolition; that's when interior crews are stretched thinnest."
      },
      {
        "h2": "Vetting a kitchen remodel contractor in Burlington",
        "body": "Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and a 3-day right to cancel. Missing items = unenforceable against you.\n\n**Vermont-specific:** Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Burlington (most expensive, often)."
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
      "bathroom-remodeling-burlington-vt",
      "electrical-contractors-burlington-vt",
      "kitchen-remodeling-vermont",
      "burlington-vt"
    ],
    "samplePropertySlug": "main-street-burlington-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Kitchen remodeling in Burlington, VT — costs, rebates, what to know",
  description: "What kitchen remodel actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Kitchen remodeling in Burlington, VT — costs, rebates, what to know",
    description: "What kitchen remodel actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
