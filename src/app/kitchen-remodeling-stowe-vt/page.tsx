import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Kitchen Remodeling Stowe VT | Alder Projects',
  description: 'Find vetted kitchen remodeling contractors in Stowe, VT. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Kitchen Remodeling Contractors in Stowe, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find vetted kitchen remodeling contractors in Stowe, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "Kitchen Remodeling in Stowe", "body": "Stowe is Vermont’s premier outdoor recreation destination. Kitchen remodeling here ranges from practical updates in year-round homes to premium renovations in vacation properties where the kitchen anchors the gathering space. Common projects: high-end custom cabinetry, premium appliance packages, large kitchen islands for entertaining, open-concept layouts connecting to great rooms, and practical updates in primary residences."},
    {"heading": "Working Remotely on Stowe Projects", "body": "Many Stowe-area contractors are experienced managing projects for owners who aren’t on-site and can coordinate remotely — useful for second-home owners. Post your project on Alder Projects and we’ll match you with contractors experienced in this type of project management."}
  ],
  "faqs": [
    {"q": "How much does kitchen remodeling cost in Stowe, VT?", "a": "Kitchen remodeling in Stowe typically runs 10–20% higher than in Burlington due to demand and premium market expectations. Expect $25,000–$100,000+ for a full renovation."},
    {"q": "Can I get a contractor to work on my Stowe vacation home remotely?", "a": "Yes — Alder Projects works for absentee homeowners. Many Stowe-area contractors are experienced managing projects for owners who aren’t on-site."},
    {"q": "When should I schedule a kitchen remodel in Stowe?", "a": "Late spring (May–June) or fall (September–October) are ideal — avoiding peak ski season when access can be complicated."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling in Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Contractors in Lamoille County", "href": "/lamoille-county-vt"},
    {"label": "Deck builders in Stowe", "href": "/deck-builders-stowe-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
