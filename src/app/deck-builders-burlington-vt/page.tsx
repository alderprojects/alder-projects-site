import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/deck-builders-burlington-vt'

const content = {
    "slug": "deck-builders-burlington-vt",
    "serviceLabel": "Deck building",
    "townName": "Burlington",
    "townSlug": "burlington-vt",
    "county": "Chittenden County",
    "metaTitle": "Deck building in Burlington, VT — costs, rebates, what to know",
    "metaDescription": "What deck build actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    "h1": "Deck building in Burlington, VT — costs, contractors, rebates",
    "leadParagraph": "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods. Deck building in Burlington runs at 1.10-1.20× statewide median. Get bids that know the Burlington reality, not generic Vermont pricing.",
    "sections": [
      {
        "h2": "Deck building costs in Burlington",
        "body": "Burlington runs 1.10-1.20× of statewide median for deck build work. Mid-2026 numbers, with Burlington adjustments.\n\n**Pressure-treated deck** — $8,000-18,000 statewide median (basic 10x16 deck with simple stairs $8,000-12,000).\n**Composite deck** — $15,000-40,000 statewide median (mid-size with aluminum railing $18,000-28,000; premium with hidden fasteners and lighting $35,000-40,000).\n\nIn Burlington, multiply by 1.10-1.20×.\n\nThe cost driver in Burlington is the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service. Get three written bids and ask each one to break out the supplementary scope they expect."
      },
      {
        "h2": "Rebates that apply for deck build in Burlington",
        "body": "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.\n\nDecks themselves do not qualify for rebates. If your project is in the shoreland buffer (250 feet from any lake larger than 10 acres, per Vermont DEC), a Vermont shoreland permit may be required — verify with the state DEC before signing.\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to Burlington (Burlington Electric Department (BED)). Bids that show \"$X off after rebates\" without naming the rebates are the ones that lose money on the actual paperwork."
      },
      {
        "h2": "When to schedule deck build in Vermont",
        "body": "Deck construction in Vermont runs late May through October. Frost-heave concerns make winter deck builds impractical for footings. Book by April for a same-summer deck; booking in July for October is risky because of weather variability and contractor schedules filling."
      },
      {
        "h2": "Vetting a deck build contractor in Burlington",
        "body": "Decks built into the side of a Vermont hill or near a lake have unique structural requirements. Ask about footing depth (Vermont frost depth runs 30-48 inches in most counties), railing code compliance (international residential code 36-inch minimum), and load engineering for snow accumulation in winter.\n\n**Vermont-specific:** Burlington has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for Burlington (most expensive, often)."
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
      "roofing-burlington-vt",
      "home-additions-burlington-vt",
      "deck-builders-vermont",
      "burlington-vt"
    ],
    "samplePropertySlug": "main-street-burlington-vt",
    "verifyDate": "2026-05-03"
  }

export const metadata: Metadata = {
  title: "Deck building in Burlington, VT — costs, rebates, what to know",
  description: "What deck build actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: "Deck building in Burlington, VT — costs, rebates, what to know",
    description: "What deck build actually costs in Burlington, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for Burlington homeowners.",
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
