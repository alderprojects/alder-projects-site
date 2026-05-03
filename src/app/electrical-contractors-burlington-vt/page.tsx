import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/electrical-contractors-burlington-vt'

const content = {
    "slug": "electrical-contractors-burlington-vt",
    "serviceLabel": "Electrical contractors",
    "townName": "Burlington",
    "townSlug": "burlington-vt",
    "county": "Chittenden County",
    "metaTitle": "Electrical contractor in Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What electrical work actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    "h1": "Electrical contractor in Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods. Electrical contractor in Burlington runs at 1.10-1.20× statewide median. Get bids that know the Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Electrical contractor costs in Burlington",
        "body": "Burlington runs 1.10-1.20× of statewide median for electrical work work. Mid-2026 numbers, with Burlington adjustments.\n\n**200-amp service upgrade** — $3,500-7,500 statewide median (older Vermont homes with 100-amp service often need this for kitchen, HVAC, or EV-charger circuits).\n**EVT $500 electrical panel rebate** applies if the upgrade is tied to electrification (heat pump, EV charger, HPWH).\n\nIn Burlington, multiply by 1.10-1.20×.\n\nThe cost driver in Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for electrical work in Burlington",
        "body": "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.\n\nElectrical service upgrades tied to electrification (heat pump, EV charger, heat pump water heater) qualify for the EVT $500 electrical panel rebate. EVT's $200 Level 2 EV charger rebate also stacks. Stand-alone panel upgrades without an electrification project don't qualify.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Burlington (Burlington Electric Department (BED)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule electrical work in Vermont",
        "body": "Vermont electrical work runs year-round indoors. Service upgrades that require a meter swap need utility coordination — schedule with your utility (GMP, BED, VPPSA member) before booking the contractor. Electrical permit fees are separate from town building permits."
      },
      {
        "h2": "Vetting a electrical work contractor in Burlington",
        "body": "All electrical work must be done by a licensed Vermont electrician (state-level Department of Public Safety license, $50-200 permit). Verify the licensed electrician's name and license number on the bid. Subcontracted electrical work often surfaces in a Vermont mechanic's lien dispute when the GC doesn't pay the electrician.\n\n**Vermont-specific:** Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Burlington (most expensive, often)."
      }
    ],
    "factIds": [
      "evt-electrical-service-upgrade",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "evt-ducted-heat-pump-rebate",
      "evt-fuel-switching-bonus"
    ],
    "relatedGuideSlugs": [
      "heat-pump-rebates-vermont",
      "vermont-rebate-stack-2026",
      "vermont-renovation-permit-guide",
      "how-to-find-contractor-vermont"
    ],
    "relatedServiceSlugs": [
      "kitchen-remodeling-burlington-vt",
      "bathroom-remodeling-burlington-vt",
      "electrical-contractors-vermont",
      "burlington-vt"
    ],
    "samplePropertySlug": "main-street-burlington-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Electrical contractor in Burlington, VT — costs, rebates, what to know",
  description: "What electrical work actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Electrical contractor in Burlington, VT — costs, rebates, what to know",
    description: "What electrical work actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
