import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/roofing-colchester-vt'

const content = {
    "slug": "roofing-colchester-vt",
    "serviceLabel": "Roofing",
    "townName": "Colchester",
    "townSlug": null,
    "county": "Chittenden County",
    "metaTitle": "Roofing in Colchester, VT — costs, rebates, what to know",
    "metaDescription": "What roof replacement actually costs in Colchester, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Colchester homeowners.",
    "h1": "Roofing in Colchester, VT — costs, contractors, rebates",
    "leadParagraph": "Lake Champlain shoreline drives the project planning conversation. Properties within 250 feet of the lake fall under Vermont's Shoreland Protection Act buffer — clearing, building, or new impervious surface in the buffer requires a state DEC shoreland permit. Roofing in Colchester runs at 1.00-1.10× statewide median. Get bids that know the Colchester reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Roofing costs in Colchester",
        "body": "Colchester runs 1.00-1.10× of statewide median for roof replacement work. Mid-2026 numbers, with Colchester adjustments.\n\n**Asphalt shingle roof replacement** — $8,000-20,000 statewide median (architectural shingles preferred for Vermont wind/ice loads; 1,500 sq ft ranch in Burlington runs $9,000-13,000).\n**Standing seam metal roof** — $20,000-40,000 statewide median (sheds snow naturally, resists ice dams, 40-70 year lifespan).\n\nIn Colchester, multiply by 1.00-1.10×.\n\nThe cost driver in Colchester is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for roof replacement in Colchester",
        "body": "GMP territory; standard rebate stack applies. Lake-adjacent properties: factor in the shoreland permit timeline (4-12 weeks) before any exterior project schedule.\n\nRoofing itself rarely qualifies for rebates, but if you are planning solar in the next 10 years, this is the moment. Vermont solar+battery stacks the federal Section 25D 30% credit plus EVT $0.40/Wh battery incentive plus Net Metering Group 2 — and replacing the roof first avoids $4,000-12,000 in solar removal/reinstall costs later.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Colchester (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule roof replacement in Vermont",
        "body": "Vermont roofing season is late April through mid-October. Mud season ends and crews can stage materials; first snow makes most asphalt installs impractical by late October. Booking a roof in May for July is realistic; booking in July for September is risky."
      },
      {
        "h2": "Vetting a roof replacement contractor in Colchester",
        "body": "Vermont winters punish roofs differently than other regions — snow load, ice dam pressure, and freeze-thaw cycles. Ask about Vermont-specific experience: ice dam mitigation, ventilation upgrades during reroofs, and snow-load engineering for steeper pitches. The cheaper out-of-state crew that doesn't know Vermont winters costs more long-term.\n\n**Vermont-specific:** Colchester has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Colchester (most expensive, often)."
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
      "window-replacement-colchester-vt",
      "painting-contractors-colchester-vt",
      "roofing-vermont"
    ],
    "samplePropertySlug": null,
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Roofing in Colchester, VT — costs, rebates, what to know",
  description: "What roof replacement actually costs in Colchester, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Colchester homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Roofing in Colchester, VT — costs, rebates, what to know",
    description: "What roof replacement actually costs in Colchester, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Colchester homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
