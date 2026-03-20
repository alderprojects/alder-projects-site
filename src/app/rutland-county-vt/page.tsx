import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Home Renovation Contractors Rutland County VT | Alder Projects',
  description: 'Find home renovation contractors in Rutland County, Vermont — Rutland City, Castleton, Brandon, and surrounding towns. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/rutland-county-vt' },
}
const content = {
  h1: 'Home Renovation Contractors in Rutland County, VT',
  heroImg: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
  intro: 'Find home renovation contractors in Rutland County, Vermont — serving Rutland City, Castleton, Brandon, Proctor, Wallingford, and surrounding communities.',
  sections: [
    { heading: 'Rutland County Vermont', body: "Rutland County is Vermont's second-largest county by population and home to Rutland City, the state's second-largest city. The area has a diverse housing stock from downtown Rutland's Victorian homes to ski-adjacent properties near Killington and Okemo. Common projects include older home renovations, ski property upgrades, and energy efficiency improvements given the area's cold winters." },
    { heading: 'What to Expect', body: 'Rutland County has an active renovation contractor market. Ski property owners near Killington and Okemo create steady demand for seasonal work. Permit requirements are set by each municipality. Most trades in the area book 4 to 8 weeks out during peak season.' },
  ],
  townLinks: [
    { label: 'Rutland', href: '/rutland-vt' },
    { label: 'Castleton', href: '/castleton-vt' },
    { label: 'Brandon', href: '/brandon-vt' },
  ],
  faqs: [
    { q: 'What towns does Alder Projects serve in Rutland County?', a: 'We serve all towns in Rutland County including Rutland City, Castleton, Brandon, Proctor, Wallingford, Fair Haven, and surrounding communities.' },
    { q: 'Do contractors serve ski properties near Killington?', a: 'Yes. We match contractors who serve Killington, Pico, and the surrounding mountain towns for both primary residences and vacation properties.' },
  ],
  ctaText: 'Post Your Project Free →',
  internalLinks: [
    { label: 'Contractors in Addison County', href: '/addison-county-vt' },
    { label: 'Contractors in Windsor County', href: '/windsor-county-vt' },
    { label: 'Roofing contractors Vermont', href: '/roofing-contractors-vermont' },
  ],
}
export default function Page() { return <SeoPage content={content} /> }