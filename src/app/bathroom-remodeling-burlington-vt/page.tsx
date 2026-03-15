import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Bathroom Remodeling Burlington VT | Alder Projects',
  description: 'Find vetted bathroom remodeling contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Bathroom Remodeling Contractors in Burlington, VT",
  "intro": "Find vetted bathroom remodeling contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "Bathroom Remodeling in Burlington", "body": "Burlington’s older housing stock means most bathrooms were built 30–80 years ago — original tile, cast iron tubs, and galvanized pipes. Common projects include full gut renovations, tub-to-shower conversions, expanding small bathrooms, adding a second bathroom, and accessibility updates."},
    {"heading": "Working with Burlington Contractors", "body": "Contractors experienced with Burlington’s older homes understand lead paint abatement, knob-and-tube wiring proximity, and original cast iron plumbing — all common in the city’s Victorian and early 20th century housing stock."}
  ],
  "faqs": [
    {"q": "How much does bathroom remodeling cost in Burlington, VT?", "a": "Expect $8,000–$20,000 for a standard Burlington bathroom remodel. High-end renovations with custom tile and premium fixtures can run $30,000+."},
    {"q": "How long does a bathroom remodel take in Burlington?", "a": "2–4 weeks for most projects. Older Burlington homes sometimes have surprises behind walls that add time."},
    {"q": "What bathroom upgrades add the most value in Burlington?", "a": "Walk-in showers, double vanities, and heated tile floors appeal to Burlington buyers. Energy-efficient fixtures are popular in Vermont’s energy-conscious market."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Bathroom remodeling in Vermont", "href": "/bathroom-remodeling-vermont"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Kitchen remodeling in Burlington", "href": "/kitchen-remodeling-burlington-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
