import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Window Replacement Burlington VT | Alder Projects',
  description: 'Find vetted window replacement contractors in Burlington, VT. Post your project free — matched with local installers in 48 hours.',
}
const content = {
  "h1": "Window Replacement Contractors in Burlington, VT",
  "heroImg": "https://images.unsplash.com/photo-1505798577917-a65157d3320a",
  "intro": "Find vetted window replacement contractors in Burlington, VT. Post your project free — matched with local window installers in 48 hours.",
  "sections": [{"heading": "Window Replacement in Burlington", "body": "Burlington’s older housing stock includes thousands of homes with original wood-frame windows from the early 1900s. These windows are often drafty, single-pane, and a major source of heat loss in Vermont winters. Replacement windows in Burlington must balance energy efficiency with historic character — in certain Burlington neighborhoods, window styles may be subject to design review. Contractors experienced with Burlington’s housing stock understand how to match profiles and trim details while maximizing energy performance."}],
  "faqs": [
    {"q": "How much does window replacement cost in Burlington, VT?", "a": "Expect $450–$1,100 per window installed in Burlington. A typical Burlington home needing 10–15 windows might run $6,000–$16,000. Historic homes requiring custom sizes or divided light patterns cost more."},
    {"q": "Can I replace windows in a historic Burlington home?", "a": "Burlington has design review requirements in some neighborhoods and historic districts. Replacement windows generally need to match the original profile and character. Your contractor should be familiar with Burlington’s historic preservation guidelines."},
    {"q": "What rebates are available for window replacement in Burlington?", "a": "Vermont’s Efficiency Vermont program offers rebates for qualifying energy-efficient window installations. Burlington Electric customers may have additional incentive programs. Your contractor can help identify applicable rebates."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Window replacement Vermont", "href": "/window-replacement-vermont"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
