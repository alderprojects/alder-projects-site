import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Deck Builders Burlington VT | Alder Projects',
  description: 'Find vetted deck builders Burlington VT homeowners rely on. Building a deck in Burlington requires frost-depth footings and Burlington zoning compliance. Post your project free — matched with local deck contractors in 48 hours.',
}

const content = {
  "h1": "Deck Builders in Burlington, VT",
  "heroImg": "https://images.unsplash.com/photo-1754597215918-b4b1f113ca77",
  "intro": "Find vetted deck builders in Burlington, VT. Post your project free — matched with local deck contractors in 48 hours.",
  "sections": [
    {"heading": "Building a Deck in Burlington", "body": "Burlington decks face specific requirements: footings must extend below the frost line (~4 feet), framing must handle Vermont snow loads, and Burlington’s zoning regulations limit lot coverage. Popular options include pressure-treated lumber, composite decking (Trex, TimberTech), rooftop decks on flat-roof buildings, and multi-level decks on Burlington’s hillside lots."}
  ],
  "faqs": [
    {"q": "How much does a deck cost in Burlington, VT?", "a": "A standard 400 sq ft pressure-treated deck in Burlington typically runs $12,000–$20,000. Composite decking adds 20–30%."},
    {"q": "Do I need a permit for a deck in Burlington?", "a": "Burlington requires permits for attached decks and decks above a certain size. Your contractor will determine what’s needed."},
    {"q": "When should I book a deck contractor in Burlington?", "a": "Burlington deck contractors are typically booked 4–8 weeks out from May through September. Post your project in March or April for summer construction."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Deck builders in Vermont", "href": "/deck-builders-vermont"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Kitchen remodeling in Burlington", "href": "/kitchen-remodeling-burlington-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
