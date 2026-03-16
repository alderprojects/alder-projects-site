import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Window Replacement Williston VT | Alder Projects',
  description: 'Find vetted window replacement contractors in Williston, VT. Post your project free — matched with local installers in 48 hours.',
}
const content = {
  "h1": "Window Replacement Contractors in Williston, VT",
  "heroImg": "https://images.unsplash.com/photo-1505798577917-a65157d3320a",
  "intro": "Find vetted window replacement contractors in Williston, VT. Post your project free — matched with local window installers in 48 hours.",
  "sections": [{"heading": "Window Replacement in Williston", "body": "Williston’s suburban housing stock — primarily homes from the 1980s through 2000s — often has original builder-grade windows that are now at or past the end of their useful life. Replacing these windows with modern double or triple-pane units delivers significant energy savings in Vermont winters and is one of the most straightforward home improvements for Williston homeowners. Williston’s proximity to Burlington means good contractor availability compared to more rural Chittenden County towns."}],
  "faqs": [
    {"q": "How much does window replacement cost in Williston, VT?", "a": "Expect $400–$1,000 per window installed in Williston. A full-house replacement of 12–18 windows typically runs $6,000–$16,000. Williston’s proximity to Burlington means competitive contractor pricing."},
    {"q": "What windows are best for Williston homes?", "a": "Double-pane windows with low-E coating and argon fill are the standard for Williston’s climate. Fiberglass or vinyl frames are most popular. For maximum energy savings, look for U-factors of 0.22 or lower."},
    {"q": "Are there rebates available for window replacement in Williston?", "a": "Vermont’s Efficiency Vermont program offers rebates for qualifying energy-efficient window installations statewide, including Williston. Your contractor can identify applicable rebates at the time of project planning."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Window replacement Vermont", "href": "/window-replacement-vermont"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
