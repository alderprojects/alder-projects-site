import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Deck Builders Vermont | Alder Projects',
  description: 'Find vetted deck builders across Vermont. Post your project free — get matched with local deck contractors in 48 hours.',
}

const content = {
  "h1": "Deck Builders in Vermont",
  "heroImg": "https://images.unsplash.com/photo-1754597215918-b4b1f113ca77",
  "intro": "Find vetted deck builders across Vermont. Post your project free — matched with local deck contractors who build for Vermont conditions.",
  "sections": [
    {"heading": "How It Works", "body": "Post your deck project free. We match you with 2–4 vetted Vermont deck contractors in your area. Compare credentials and bids, then choose your contractor."},
    {"heading": "Deck Building in Vermont", "body": "Vermont decks need to be built differently than decks in warmer climates. Proper footing depth below the frost line (typically 4–5 feet), pressure-treated or composite materials rated for moisture, and freeze-thaw hardware all matter. Common projects include new deck construction, deck replacements, deck additions, screened porches, and composite decking upgrades."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/deck-builders-burlington-vt"},
    {"label": "Middlebury", "href": "/deck-builders-middlebury-vt"},
    {"label": "Stowe", "href": "/deck-builders-stowe-vt"}
  ],
  "faqs": [
    {"q": "How much does a deck cost in Vermont?", "a": "A basic pressure-treated deck typically costs $8,000–$18,000. Composite decking runs 20–30% more. Elevated decks with stairs and complex layouts can run $20,000–$40,000."},
    {"q": "Do I need a permit to build a deck in Vermont?", "a": "Most Vermont towns require a permit for decks attached to the house or over a certain size. Your contractor will pull the necessary permits as part of the project."},
    {"q": "What’s the best time to build a deck in Vermont?", "a": "May through October is ideal. Most contractors book 4–8 weeks out in peak season — post your project early to secure a good contractor for summer construction."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Deck builders in Burlington", "href": "/deck-builders-burlington-vt"},
    {"label": "Deck builders in Stowe", "href": "/deck-builders-stowe-vt"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
