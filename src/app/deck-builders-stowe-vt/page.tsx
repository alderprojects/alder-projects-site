import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Deck Builders Stowe VT | Alder Projects',
  description: 'Find vetted deck builders Stowe VT homeowners trust. Deck builders in Stowe must handle 100+ inches of annual snowfall and extreme freeze-thaw conditions. Post your project free — matched with local deck contractors in 48 hours.',
}

const content = {
  "h1": "Deck Builders in Stowe, VT",
  "heroImg": "https://images.unsplash.com/photo-1754597215918-b4b1f113ca77",
  "intro": "Find vetted deck builders in Stowe, VT. Post your project free — matched with local deck contractors in 48 hours.",
  "sections": [
    {"heading": "Building a Deck in Stowe", "body": "In Stowe, outdoor space is part of what you’re paying for. Deck builders here need to handle significant snow loads — the area receives 100+ inches in a typical winter. Structural framing, hardware, and fasteners must be specified for these conditions. Popular projects: multi-level decks on sloped lots, covered decks and screened porches, wraparound porches on chalets and farmhouses, premium composite decking, and hot tub platforms."}
  ],
  "faqs": [
    {"q": "How much does a deck cost in Stowe, VT?", "a": "Deck costs in Stowe run higher than the Vermont average — expect $15,000–$35,000 for a standard deck. Premium composite and complex multi-level builds can run $40,000–$60,000."},
    {"q": "Do I need a permit to build a deck in Stowe?", "a": "Yes — Stowe requires building permits for decks. Your contractor will manage the application."},
    {"q": "Can Stowe contractors work on my property if I’m not local?", "a": "Yes — Stowe-area contractors regularly manage projects for absentee owners. Post your project and we’ll match you with contractors experienced in remote project management."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Deck builders in Vermont", "href": "/deck-builders-vermont"},
    {"label": "Contractors in Lamoille County", "href": "/lamoille-county-vt"},
    {"label": "Kitchen remodeling in Stowe", "href": "/kitchen-remodeling-stowe-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
