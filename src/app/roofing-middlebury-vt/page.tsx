import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Roofing Contractors Middlebury VT | Alder Projects',
  description: 'Find vetted roofing contractors in Middlebury, VT. Post your project free — matched with local roofers in 48 hours.',
}
const content = {
  "h1": "Roofing Contractors in Middlebury, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090449192-4ab1d00cb735",
  "intro": "Find vetted roofing contractors in Middlebury, VT. Post your project free — matched with local roofers in 48 hours.",
  "sections": [{"heading": "Roofing in Middlebury", "body": "Middlebury’s mix of historic college-town homes, working-class housing, and rural farmhouses means roofing contractors need experience across a range of roof types and ages. Many Middlebury homes have original slate roofs worth restoring rather than replacing with asphalt — experienced local contractors know when slate is salvageable and how to work with it. The Addison County contractor market is smaller than Chittenden County, so booking lead times can be longer."}],
  "faqs": [
    {"q": "How much does roof replacement cost in Middlebury, VT?", "a": "Expect $8,000–$18,000 for a standard asphalt shingle replacement in Middlebury. Slate roof restoration runs significantly more — $20,000–$60,000 depending on slate condition — but preserves the character and value of older Middlebury homes."},
    {"q": "Should I restore or replace the original slate roof on my Middlebury home?", "a": "Slate roofs in good condition can last 100+ years. If less than 20–30% of the slates need replacement, restoration is typically more cost-effective. A qualified slate roofer can assess your roof’s condition. Alder Projects can match you with contractors experienced in slate."},
    {"q": "When should I book a roofer in Addison County?", "a": "The Addison County contractor market is smaller than Burlington — quality roofers can book 6–12 weeks out in peak season (May–September). Post your project early, especially for planned replacements."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Roofing contractors Vermont", "href": "/roofing-contractors-vermont"}, {"label": "Contractors Addison County", "href": "/addison-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
