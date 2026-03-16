import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Painting Contractors Vermont | Alder Projects',
  description: 'Find vetted painting contractors across Vermont. Post your project free — matched with local painters in 48 hours.',
}
const content = {
  "h1": "Painting Contractors in Vermont",
  "heroImg": "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09",
  "intro": "Find vetted painting contractors across Vermont. Post your project free — matched with local painters in 48 hours.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your painting project free. We match you with 2–4 vetted Vermont painting contractors in your area. Interior or exterior, residential or commercial — compare bids and hire who you want."},
    {"heading": "Painting Contractors in Vermont", "body": "Vermont’s climate presents specific challenges for exterior painting — proper surface prep, primer selection, and timing around freeze-thaw windows are critical for paint to adhere and last. Interior painting in Vermont’s older homes often involves lead paint abatement, plaster repair, and careful prep work. Common projects include full interior repaint, exterior house painting, deck staining, historic home restoration painting, and commercial painting."}
  ],
  "townLinks": [{"label": "Burlington", "href": "/painting-contractors-burlington-vt"}, {"label": "Essex", "href": "/painting-contractors-essex-vt"}],
  "faqs": [
    {"q": "How much does house painting cost in Vermont?", "a": "Interior painting for a typical Vermont home (3 bedrooms, common areas) runs $3,000–$8,000. Exterior painting runs $4,000–$12,000 depending on home size, stories, and surface condition. Homes requiring significant prep or lead paint work cost more."},
    {"q": "When can I paint the exterior of my house in Vermont?", "a": "Vermont’s exterior painting season runs May through September. Temperatures need to be consistently above 50°F and the surface must be dry. Most contractors book 4–8 weeks out during peak season."},
    {"q": "Do Vermont homes have lead paint issues?", "a": "Homes built before 1978 may contain lead-based paint. Vermont has specific regulations around lead paint disturbance and abatement. Contractors working on pre-1978 homes should be EPA RRP (Renovation, Repair, and Painting) certified."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Painting contractors Burlington", "href": "/painting-contractors-burlington-vt"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}, {"label": "Kitchen remodeling Vermont", "href": "/kitchen-remodeling-vermont"}]
}
export default function Page() { return <SeoPage content={content} /> }
