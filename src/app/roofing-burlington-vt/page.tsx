import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Roofing Contractors Burlington VT | Alder Projects',
  description: 'Find vetted roofing Burlington VT contractors. Roofing in Burlington requires experience across Victorian rooflines, flat-roof triple-deckers, and modern condos. Post your project free — matched with local roofers in 48 hours.',
}
const content = {
  "h1": "Roofing Contractors in Burlington, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090449192-4ab1d00cb735",
  "intro": "Find vetted roofing contractors in Burlington, VT. Post your project free — matched with local roofers in 48 hours.",
  "sections": [{"heading": "Roofing in Burlington", "body": "Burlington’s varied housing stock — from Victorian homes with complex rooflines to flat-roof triple-deckers to modern condos — means roofing contractors in Burlington need experience across multiple roof types. Burlington’s urban setting also means neighbors, street trees, and limited staging areas that experienced local roofers know how to navigate. Burlington requires permits for full replacements and has specific disposal regulations for old roofing materials."}],
  "faqs": [
    {"q": "How much does roof replacement cost in Burlington, VT?", "a": "A standard roof replacement in Burlington runs $8,000–$18,000 for asphalt shingles. Complex rooflines, steep pitches, or flat roof systems cost more. Metal roofing runs $15,000–$30,000 for a typical Burlington home."},
    {"q": "How do I deal with ice dams in Burlington?", "a": "Ice dams form when heat escapes through the roof and melts snow that refreezes at the eaves. The long-term fix involves improving attic insulation and ventilation. Short-term, contractors use heat cables or steam removal. Burlington roofers experienced with older homes understand the insulation challenges common in the city."},
    {"q": "Do I need a permit for a roof replacement in Burlington?", "a": "Burlington requires a building permit for full roof replacements. Simple re-roofing over existing shingles may be exempt depending on scope. Your contractor will advise and pull permits as needed."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Roofing contractors Vermont", "href": "/roofing-contractors-vermont"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
