import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Roofing Contractors South Burlington VT | Alder Projects',
  description: 'Find vetted roofing South Burlington VT contractors. Roofing in South Burlington is in high demand as 1990s-era roofs across the suburb reach end of life. Post your project free — matched with local roofers in 48 hours.',
}
const content = {
  "h1": "Roofing Contractors in South Burlington, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090449192-4ab1d00cb735",
  "intro": "Find vetted roofing contractors in South Burlington, VT. Post your project free — matched with local roofers in 48 hours.",
  "sections": [{"heading": "Roofing in South Burlington", "body": "South Burlington’s predominantly suburban housing stock from the 1970s–1990s means many homes are reaching the end of their original roof’s lifespan. A 25–30 year asphalt shingle roof installed in the 1990s is now due for replacement. South Burlington’s relatively straightforward ranch and colonial rooflines make it efficient for contractors to work on, often resulting in competitive pricing compared to more complex urban rooflines."}],
  "faqs": [
    {"q": "How much does roof replacement cost in South Burlington?", "a": "A standard South Burlington roof replacement runs $7,000–$16,000 for asphalt shingles. The town’s typical ranch and colonial homes are efficient for contractors to work on, which can keep costs lower than complex Victorian rooflines."},
    {"q": "How do I know if my South Burlington roof needs replacing?", "a": "Signs include missing or curling shingles, granules in gutters, daylight visible through the attic, or a roof over 20–25 years old. Many South Burlington homes from the 1990s are now at this threshold."},
    {"q": "Do I need a permit for roof replacement in South Burlington?", "a": "South Burlington requires building permits for full roof replacements. Your contractor will pull the necessary permits and schedule inspections."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Roofing contractors Vermont", "href": "/roofing-contractors-vermont"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
