import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/roofing-south-burlington-vt'

const content = {
    "slug": "roofing-south-burlington-vt",
    "serviceLabel": "Roofing",
    "townName": "South Burlington",
    "townSlug": null,
    "county": "Chittenden County",
    "metaTitle": "Roofing in South Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What roof replacement actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
    "h1": "Roofing in South Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Chittenden County metro tier. Newer housing stock than Burlington proper means fewer surprise electrical upgrades. GMP territory — full rebate stack applies. Roofing in South Burlington runs at 1.05-1.15× statewide median. Get bids that know the South Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Roofing costs in South Burlington",
        "body": "South Burlington runs 1.05-1.15× of statewide median for roof replacement work. Mid-2026 numbers, with South Burlington adjustments.\n\n**Asphalt shingle roof replacement** — $8,000-20,000 statewide median (architectural shingles preferred for Vermont wind/ice loads; 1,500 sq ft ranch in Burlington runs $9,000-13,000).\n**Standing seam metal roof** — $20,000-40,000 statewide median (sheds snow naturally, resists ice dams, 40-70 year lifespan).\n\nIn South Burlington, multiply by 1.05-1.15×.\n\nThe cost driver in South Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for roof replacement in South Burlington",
        "body": "GMP territory. The $2,000 per condenser income-eligible heat pump bonus applies (households at or below 80% AMI). Stack with EVT $2,200 ducted, $400 fuel-switching, $500 panel upgrade rebate.\n\nRoofing itself rarely qualifies for rebates, but if you are planning solar in the next 10 years, this is the moment. Vermont solar+battery stacks the federal Section 25D 30% credit plus EVT $0.40/Wh battery incentive plus Net Metering Group 2 — and replacing the roof first avoids $4,000-12,000 in solar removal/reinstall costs later.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to South Burlington (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule roof replacement in Vermont",
        "body": "Vermont roofing season is late April through mid-October. Mud season ends and crews can stage materials; first snow makes most asphalt installs impractical by late October. Booking a roof in May for July is realistic; booking in July for September is risky."
      },
      {
        "h2": "Vetting a roof replacement contractor in South Burlington",
        "body": "Vermont winters punish roofs differently than other regions — snow load, ice dam pressure, and freeze-thaw cycles. Ask about Vermont-specific experience: ice dam mitigation, ventilation upgrades during reroofs, and snow-load engineering for steeper pitches. The cheaper out-of-state crew that doesn't know Vermont winters costs more long-term.\n\n**Vermont-specific:** South Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for South Burlington (most expensive, often)."
      }
    ],
    "factIds": [
      "vt-cost-roof-asphalt",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-cost-roof-standing-seam"
    ],
    "relatedGuideSlugs": [
      "how-much-does-roof-replacement-cost-vermont",
      "vermont-solar-battery-stack-2026",
      "how-to-find-contractor-vermont",
      "vermont-contractor-red-flags"
    ],
    "relatedServiceSlugs": [
      "window-replacement-south-burlington-vt",
      "painting-contractors-south-burlington-vt",
      "roofing-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Roofing in South Burlington, VT — costs, rebates, what to know",
  description: "What roof replacement actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Roofing in South Burlington, VT — costs, rebates, what to know",
    description: "What roof replacement actually costs in South Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for South Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
