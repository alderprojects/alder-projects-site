import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Kitchen Remodeling Essex VT | Alder Projects',
  description: 'Find kitchen remodeling contractors in Essex and Essex Junction, VT. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/kitchen-remodeling-essex-vt' },
}
const content = {
  "h1": "Kitchen Remodeling Contractors in Essex, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find kitchen remodeling contractors in Essex and Essex Junction, VT. Post free and get matched.",
  "sections": [{"heading":"Kitchen Remodeling in Essex","body":"Essex and Essex Junction form one of Vermont's most populated areas with a wide range of housing. Common projects include opening floor plans, updating cabinets and countertops, and adding islands."},{"heading":"What to Expect","body":"Quality kitchen contractors in Essex book out 4–8 weeks. Structural and electrical work requires permits through Essex Planning and Zoning."}],
  "faqs": [{"q":"How much does kitchen remodeling cost in Essex, VT?","a":"A standard kitchen remodel in Essex runs $18,000–$55,000. Full gut renovations can reach $70,000+."},{"q":"Do I need a permit for a kitchen remodel in Essex?","a":"Yes, for electrical, plumbing, and structural changes."},{"q":"How long does a kitchen remodel take in Essex?","a":"Plan for 5–9 weeks once work begins."}],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label":"Kitchen remodeling in Vermont","href":"/kitchen-remodeling-vermont"},{"label":"Painting contractors in Essex","href":"/painting-contractors-essex-vt"},{"label":"Contractors in Chittenden County","href":"/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }