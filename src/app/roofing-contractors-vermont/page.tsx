import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Roofing Contractors Vermont | Alder Projects',
  description: 'Find vetted roofing contractors across Vermont. Post your project free — matched with local roofers in 48 hours.',
}
const content = {
  "h1": "Roofing Contractors in Vermont",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090449192-4ab1d00cb735",
  "intro": "Find vetted roofing contractors across Vermont. Post your project free — matched with local roofers in 48 hours.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your roofing project free. We match you with 2–4 vetted Vermont roofing contractors in your area. No cold calls, no spam — just qualified local roofers actively taking on work."},
    {"heading": "Roofing in Vermont", "body": "Vermont roofs work hard. Heavy snow loads, ice dams, freeze-thaw cycles, and persistent moisture make roofing one of the most critical maintenance investments a Vermont homeowner can make. Common projects include full roof replacement, ice dam prevention and repair, flat roof systems, metal roofing installation, and emergency repairs. Vermont contractors experienced with local conditions know how to address these challenges properly."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/roofing-burlington-vt"},
    {"label": "South Burlington", "href": "/roofing-south-burlington-vt"},
    {"label": "Stowe", "href": "/roofing-stowe-vt"},
    {"label": "Middlebury", "href": "/roofing-middlebury-vt"}
  ],
  "faqs": [
    {"q": "How much does a roof replacement cost in Vermont?", "a": "A standard asphalt shingle roof replacement in Vermont runs $8,000–$20,000 for a typical home. Metal roofing costs more upfront ($15,000–$35,000) but lasts significantly longer in Vermont’s climate. Post your project for accurate bids based on your roof’s size and pitch."},
    {"q": "When is the best time to replace a roof in Vermont?", "a": "Late spring through early fall (May–October) is ideal. Vermont contractors can work year-round for emergency repairs, but cold temperatures affect adhesive strips on shingles. Booking in late summer for fall installation is common."},
    {"q": "What type of roofing is best for Vermont?", "a": "Architectural asphalt shingles are the most common and cost-effective choice. Metal roofing (standing seam or steel panels) is increasingly popular for its durability and snow-shedding properties. Rubber membranes are standard for low-slope or flat roofs."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Roofing in Burlington", "href": "/roofing-burlington-vt"}, {"label": "Roofing in Stowe", "href": "/roofing-stowe-vt"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
