import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Kitchen Remodeling Williston VT | Alder Projects',
  description: 'Find kitchen remodeling contractors in Williston, VT. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/kitchen-remodeling-williston-vt' },
}
const content = {
  "h1": "Kitchen Remodeling Contractors in Williston, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find kitchen remodeling contractors in Williston, VT. Post free and get matched with local contractors.",
  "sections": [{"heading":"Kitchen Remodeling in Williston","body":"Williston is one of Chittenden County's fastest-growing towns with a mix of established neighborhoods and newer subdivisions. Kitchen projects commonly involve opening floor plans in ranch-style homes, updating builder-grade finishes, and adding islands."},{"heading":"What to Expect","body":"Williston contractors book 4–8 weeks out for most projects. Permits for structural changes are required through Williston Planning and Zoning."}],
  "faqs": [{"q":"How much does kitchen remodeling cost in Williston, VT?","a":"Expect $18,000–$55,000 for a standard kitchen remodel. Full renovations with custom work can reach $75,000+."},{"q":"Do I need a permit for a kitchen remodel in Williston?","a":"Permits are required for electrical, plumbing, or structural changes."},{"q":"How long does a kitchen remodel take in Williston?","a":"Most kitchen remodels take 5–9 weeks once work begins."}],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label":"Kitchen remodeling in Vermont","href":"/kitchen-remodeling-vermont"},{"label":"Contractors in Chittenden County","href":"/chittenden-county-vt"},{"label":"Kitchen remodeling in Burlington","href":"/kitchen-remodeling-burlington-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }