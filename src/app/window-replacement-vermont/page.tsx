import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Window Replacement Vermont | Alder Projects',
  description: 'Find vetted window replacement contractors across Vermont. Post your project free — matched with local installers in 48 hours.',
}
const content = {
  "h1": "Window Replacement Contractors in Vermont",
  "heroImg": "https://images.unsplash.com/photo-1505798577917-a65157d3320a",
  "intro": "Find vetted window replacement contractors across Vermont. Post your project free — matched with local window installers in 48 hours.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your window replacement project free. We match you with 2–4 vetted Vermont window contractors in your area. Compare bids and choose who you want to work with."},
    {"heading": "Window Replacement in Vermont", "body": "Vermont winters make energy-efficient windows one of the highest-ROI home improvements available. Drafty or single-pane windows account for a significant portion of heating costs. Common projects include full window replacement (all windows), selective replacement (worst performers first), historic window restoration in older Vermont homes, and egress window installation for basement finishing. Vermont’s energy efficiency programs often provide rebates for qualified window upgrades."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/window-replacement-burlington-vt"},
    {"label": "Williston", "href": "/window-replacement-williston-vt"},
    {"label": "Stowe", "href": "/window-replacement-stowe-vt"}
  ],
  "faqs": [
    {"q": "How much does window replacement cost in Vermont?", "a": "Window replacement in Vermont typically runs $400–$1,200 per window installed, depending on window size, type, and brand. A full-house replacement (15–20 windows) might run $8,000–$20,000. Vermont Weatherization programs may offset costs for income-qualified homeowners."},
    {"q": "What windows are best for Vermont winters?", "a": "Double or triple-pane windows with low-E coating and argon or krypton gas fill are standard for Vermont’s climate. Look for U-factors of 0.22 or lower for maximum energy efficiency. Fiberglass or vinyl frames are more thermally stable than wood in Vermont’s temperature swings."},
    {"q": "Do I need a permit for window replacement in Vermont?", "a": "Like-for-like window replacement in existing openings typically doesn’t require a permit. Enlarging or adding new window openings requires a permit. Egress window installation always requires a permit. Your contractor will advise on your specific project."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Window replacement Burlington", "href": "/window-replacement-burlington-vt"}, {"label": "Window replacement Stowe", "href": "/window-replacement-stowe-vt"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
