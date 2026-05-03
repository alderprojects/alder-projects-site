import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/deck-builders-middlebury-vt'

const content = {
    "slug": "deck-builders-middlebury-vt",
    "serviceLabel": "Deck building",
    "townName": "Middlebury",
    "townSlug": "middlebury-vt",
    "county": "Addison County",
    "metaTitle": "Deck building in Middlebury, VT — costs, rebates, what to know",
    "metaDescription": "What deck build actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    "h1": "Deck building in Middlebury, VT — costs, contractors, rebates",
    "leadParagraph": "College town. Middlebury College drives both the rental market and contractor pipeline. Student rental conversion rules tightened in 2025 — verify current cap with town zoning before assuming rental yield math. Deck building in Middlebury runs at 1.00× statewide median. Get bids that know the Middlebury reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Deck building costs in Middlebury",
        "body": "Middlebury runs 1.00× of statewide median for deck build work. Mid-2026 numbers, with Middlebury adjustments.\n\n**Pressure-treated deck** — $8,000-18,000 statewide median (basic 10x16 deck with simple stairs $8,000-12,000).\n**Composite deck** — $15,000-40,000 statewide median (mid-size with aluminum railing $18,000-28,000; premium with hidden fasteners and lighting $35,000-40,000).\n\nIn Middlebury, multiply by 1.00×.\n\nThe cost driver in Middlebury is the contractor pool size. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for deck build in Middlebury",
        "body": "GMP territory. $2,000 per condenser income-eligible bonus applies. Stack with EVT $2,200 ducted heat pump, $400 fuel-switching, $500 panel upgrade.\n\nDecks themselves do not qualify for rebates. If your project is in the shoreland buffer (250 feet from any lake larger than 10 acres, per Vermont DEC), a Vermont shoreland permit may be required — verify with the state DEC before signing.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Middlebury (Green Mountain Power (GMP)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule deck build in Vermont",
        "body": "Deck construction in Vermont runs late May through October. Frost-heave concerns make winter deck builds impractical for footings. Book by April for a same-summer deck; booking in July for October is risky because of weather variability and contractor schedules filling."
      },
      {
        "h2": "Vetting a deck build contractor in Middlebury",
        "body": "Decks built into the side of a Vermont hill or near a lake have unique structural requirements. Ask about footing depth (Vermont frost depth runs 30-48 inches in most counties), railing code compliance (international residential code 36-inch minimum), and load engineering for snow accumulation in winter.\n\n**Vermont-specific:** Middlebury has narrower contractor density. Start the search 4-5 months before you want work to begin, not 4-5 weeks. The town's permit log is a public record and a better contractor reference than online reviews."
      }
    ],
    "factIds": [
      "vt-cost-deck-pt",
      "vt-residential-contract-statute",
      "vt-contractor-registration-threshold",
      "vt-cost-deck-composite"
    ],
    "relatedGuideSlugs": [
      "how-much-does-a-deck-cost-vermont",
      "vermont-renovation-permit-guide",
      "vermont-flood-zone-renovation",
      "how-to-find-contractor-vermont"
    ],
    "relatedServiceSlugs": [
      "roofing-middlebury-vt",
      "home-additions-middlebury-vt",
      "deck-builders-vermont",
      "middlebury-vt"
    ],
    "samplePropertySlug": "main-street-middlebury-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Deck building in Middlebury, VT — costs, rebates, what to know",
  description: "What deck build actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Deck building in Middlebury, VT — costs, rebates, what to know",
    description: "What deck build actually costs in Middlebury, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Middlebury homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
