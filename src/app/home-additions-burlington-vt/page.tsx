import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Home Additions Burlington VT | Alder Projects',
  description: 'Find vetted home addition contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Home Additions Contractors in Burlington, VT",
  "intro": "Find vetted home addition contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "Home Additions in Burlington", "body": "Burlington’s tight housing inventory has pushed many homeowners toward adding on rather than moving. Key considerations include Burlington’s zoning and lot coverage limits, setback requirements, Act 250 review for larger projects, and the challenges of tying into the city’s older housing stock. Common addition types: first-floor bedroom and bathroom additions, mudrooms, garage additions, and second-floor additions on single-story ranches."}
  ],
  "faqs": [
    {"q": "How much does a home addition cost in Burlington, VT?", "a": "Expect $175–$300 per square foot for a Burlington addition. A 300 sq ft addition might run $52,000–$90,000."},
    {"q": "How long does a home addition take in Burlington?", "a": "Plan 4–8 months from project start to completion, including permitting. Burlington permitting typically takes 6–10 weeks."},
    {"q": "What additions add the most value in Burlington?", "a": "Primary bedroom suites and additional bathrooms add the most value in Burlington’s market. Mudrooms are practical and appreciated by buyers."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Home additions in Vermont", "href": "/home-additions-vermont"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Kitchen remodeling in Burlington", "href": "/kitchen-remodeling-burlington-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
