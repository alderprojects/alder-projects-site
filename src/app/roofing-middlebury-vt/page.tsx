import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/roofing-middlebury-vt'

const content = {
    "slug": "roofing-middlebury-vt",
    "serviceLabel": "Roofing",
    "townName": "Middlebury",
    "townSlug": "middlebury-vt",
    "county": "Addison County",
    "metaTitle": "Roofing in Middlebury, VT — costs, rebates, what to know",
    "metaDescription": "What roof replacement actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    "h1": "Roofing in Middlebury, VT — costs, contractors, rebates",
    "leadParagraph": "College town. Middlebury College drives both the rental market and contractor pipeline. Student rental conversion rules tightened in 2025 — verify current cap with town zoning before assuming rental yield math. Roofing in Middlebury runs at 1.00× statewide median. Get bids that know the Middlebury reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Roofing costs in Middlebury",
        "body": "Middlebury runs 1.00× of statewide median for roof replacement work. Mid-2026 numbers, with Middlebury adjustments.\n\n**Asphalt shingle roof replacement** — $8,000-20,000 statewide median (architectural shingles preferred for Vermont wind/ice loads; 1,500 sq ft ranch in Burlington runs $9,000-13,000).\n**Standing seam metal roof** — $20,000-40,000 statewide median (sheds snow naturally, resists ice dams, 40-70 year lifespan).\n\nIn Middlebury, multiply by 1.00×.\n\nThe cost driver in Middlebury is the contractor pool size. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for roof replacement in Middlebury",
        "body": "GMP territory. $2,000 per condenser income-eligible bonus applies. Stack with EVT $2,200 ducted heat pump, $400 fuel-switching, $500 panel upgrade.\n\nRoofing itself rarely qualifies for rebates, but if you are planning solar in the next 10 years, this is the moment. Vermont solar+battery stacks the federal Section 25D 30% credit plus EVT $0.40/Wh battery incentive plus Net Metering Group 2 — and replacing the roof first avoids $4,000-12,000 in solar removal/reinstall costs later.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Middlebury (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule roof replacement in Vermont",
        "body": "Vermont roofing season is late April through mid-October. Mud season ends and crews can stage materials; first snow makes most asphalt installs impractical by late October. Booking a roof in May for July is realistic; booking in July for September is risky."
      },
      {
        "h2": "Vetting a roof replacement contractor in Middlebury",
        "body": "Vermont winters punish roofs differently than other regions — snow load, ice dam pressure, and freeze-thaw cycles. Ask about Vermont-specific experience: ice dam mitigation, ventilation upgrades during reroofs, and snow-load engineering for steeper pitches. The cheaper out-of-state crew that doesn't know Vermont winters costs more long-term.\n\n**Vermont-specific:** Middlebury has narrower contractor density. Start the search 4-5 months before you want work to begin, not 4-5 weeks. The town's permit log is a public record and a better contractor reference than online reviews."
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
      "window-replacement-middlebury-vt",
      "painting-contractors-middlebury-vt",
      "roofing-vermont",
      "middlebury-vt"
    ],
    "samplePropertySlug": "main-street-middlebury-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Roofing in Middlebury, VT — costs, rebates, what to know",
  description: "What roof replacement actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Roofing in Middlebury, VT — costs, rebates, what to know",
    description: "What roof replacement actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
