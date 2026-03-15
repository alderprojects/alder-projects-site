import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Basement Finishing Vermont | Alder Projects',
  description: 'Find vetted basement finishing contractors across Vermont. Post your project free — get matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Basement Finishing Contractors in Vermont",
  "heroImg": "https://images.unsplash.com/photo-1646592491741-e79ae5953486",
  "intro": "Find vetted basement finishing contractors across Vermont. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your basement finishing project free. We match you with 2–4 vetted Vermont contractors who specialize in basement work in your area. Compare bids and credentials, then hire who you want. <strong>Free to post</strong> — homeowners pay nothing. <strong>Vetted contractors only</strong> — every contractor is reviewed before receiving leads."},
    {"heading": "Basement Finishing in Vermont", "body": "Vermont homes often have large, unfinished basements — valuable square footage that can be converted to living space, a home office, rental unit, or recreation room. Common projects include framing and insulation, drywall and finishing, egress window installation, bathroom rough-in, and electrical upgrades. Vermont’s climate requires specific attention to moisture barriers and insulation to prevent frost-related issues."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/basement-finishing-burlington-vt"},
    {"label": "South Burlington", "href": "/basement-finishing-south-burlington-vt"},
    {"label": "Middlebury", "href": "/basement-finishing-middlebury-vt"}
  ],
  "faqs": [
    {"q": "How much does basement finishing cost in Vermont?", "a": "Basement finishing in Vermont typically runs $25–$60 per square foot fully finished, or $15,000–$45,000 for a standard 600–800 sq ft basement. Adding a bathroom adds $8,000–$15,000. Post your project for accurate local bids."},
    {"q": "Do I need a permit to finish my basement in Vermont?", "a": "Yes — most Vermont towns require a building permit for basement finishing, especially if adding electrical, plumbing, or egress windows. Your contractor will manage the permitting process."},
    {"q": "How long does basement finishing take in Vermont?", "a": "A standard basement finish takes 6–10 weeks. Projects with bathrooms or egress windows take longer. Most Vermont contractors book 4–8 weeks out for interior work."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Basement finishing in Burlington", "href": "/basement-finishing-burlington-vt"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Kitchen remodeling Vermont", "href": "/kitchen-remodeling-vermont"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
