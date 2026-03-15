import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Home Additions Vermont | Alder Projects',
  description: 'Find vetted home addition contractors across Vermont. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Home Addition Contractors in Vermont",
  "intro": "Find vetted home addition contractors across Vermont. Post your project free — matched with local general contractors in 48 hours.",
  "sections": [
    {"heading": "How It Works", "body": "Post your home addition project free. We match you with 2–4 vetted Vermont contractors experienced in additions. Compare bids and choose who you want to work with."},
    {"heading": "Home Additions in Vermont", "body": "Vermont’s tight housing inventory makes adding on to an existing home an attractive alternative to moving. Common projects include bedroom additions, mudroom additions (essential in Vermont), garage additions, sunrooms and three-season rooms, and accessory dwelling units (ADUs)."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/home-additions-burlington-vt"},
    {"label": "Vergennes", "href": "/home-additions-vergennes-vt"}
  ],
  "faqs": [
    {"q": "How much does a home addition cost in Vermont?", "a": "Home additions in Vermont typically cost $150–$300 per square foot depending on complexity and finishes. A 400 sq ft addition might run $60,000–$120,000."},
    {"q": "How long does a home addition take in Vermont?", "a": "A typical addition takes 3–6 months from permit approval to completion. The permitting process can take 4–12 weeks depending on your town and scope."},
    {"q": "Do home additions require permits in Vermont?", "a": "Yes — all structural additions require building permits. Projects in Act 250 jurisdictions may require additional review. Your contractor manages the permitting process."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Home additions in Burlington", "href": "/home-additions-burlington-vt"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Kitchen remodeling in Vermont", "href": "/kitchen-remodeling-vermont"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
