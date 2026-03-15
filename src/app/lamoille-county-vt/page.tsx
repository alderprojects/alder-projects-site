import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Contractors Lamoille County VT | Alder Projects',
  description: 'Find vetted renovation contractors in Lamoille County, VT — Stowe, Morristown, Hyde Park and surrounding towns.',
}

const content = {
  "h1": "Home Renovation Contractors in Lamoille County, VT",
  "intro": "Find vetted renovation contractors in Lamoille County, VT — Stowe, Morristown, Hyde Park and surrounding towns.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your project free. We match you with 2–4 vetted Lamoille County contractors. You compare bids and choose — no obligation."},
    {"heading": "Renovation in Lamoille County", "body": "Lamoille County is ski country and second-home territory. Stowe anchors the market, with Morristown, Hyde Park, and Johnson making up the rest. The renovation market is driven by a mix of primary homeowners and vacation property owners keeping up with Vermont’s demanding climate."}
  ],
  "townLinks": [
    {"label": "Stowe kitchen remodeling", "href": "/kitchen-remodeling-stowe-vt"},
    {"label": "Stowe deck builders", "href": "/deck-builders-stowe-vt"},
    {"label": "Morristown bathroom remodeling", "href": "/bathroom-remodeling-morristown-vt"}
  ],
  "faqs": [
    {"q": "Is Stowe expensive for contractors?", "a": "Labor costs in the Stowe area tend to run 10–20% higher than in Burlington, reflecting market demand. Premium materials are also common in the Stowe renovation market."},
    {"q": "Do second-home owners use Alder Projects?", "a": "Yes — Alder Projects works for both primary and vacation properties. Many Stowe-area projects come from owners who aren’t local and need a reliable way to find vetted contractors remotely."},
    {"q": "What’s the busiest season for contractors in Lamoille County?", "a": "Spring and fall are busy. Ski season slows exterior work but interior renovations continue year-round. Book early for summer projects."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Deck builders Vermont", "href": "/deck-builders-vermont"},
    {"label": "Chittenden County contractors", "href": "/chittenden-county-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
