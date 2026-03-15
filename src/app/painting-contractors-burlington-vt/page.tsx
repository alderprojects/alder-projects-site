import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Painting Contractors Burlington VT | Alder Projects',
  description: 'Find vetted painting contractors in Burlington, VT. Post your project free — matched with local painters in 48 hours.',
}
const content = {
  "h1": "Painting Contractors in Burlington, VT",
  "heroImg": "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09",
  "intro": "Find vetted painting contractors in Burlington, VT. Post your project free — matched with local painters in 48 hours.",
  "sections": [{"heading": "Painting Contractors in Burlington", "body": "Burlington’s older homes require painting contractors who understand lead paint protocols, plaster surfaces, and historic trim details. Exterior painting in Burlington’s dense neighborhoods requires experienced staging and neighbor coordination. Burlington has specific regulations around lead paint disturbance — contractors working on pre-1978 homes must be EPA RRP certified. Interior painting in Burlington’s Victorian and Craftsman homes often involves intricate woodwork and original plaster that benefits from careful prep and application."}],
  "faqs": [
    {"q": "How much does house painting cost in Burlington, VT?", "a": "Interior repainting for a typical Burlington home runs $3,500–$8,000. Exterior painting runs $5,000–$14,000 depending on home size, siding condition, and story count. Homes requiring lead paint prep work add to the cost."},
    {"q": "Do Burlington painting contractors need lead paint certification?", "a": "Yes — Vermont requires EPA RRP certification for contractors disturbing more than 6 sq ft of painted surface inside or 20 sq ft outside on pre-1978 homes. Always verify your contractor’s certification for older Burlington homes."},
    {"q": "When is the best time for exterior painting in Burlington?", "a": "May through September is ideal. Burlington’s lake effect can bring unexpected weather — experienced local painters know how to schedule around it. Book early: Burlington painters fill their exterior season quickly."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Painting contractors Vermont", "href": "/painting-contractors-vermont"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
