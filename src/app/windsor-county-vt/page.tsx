import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Home Renovation Contractors Windsor County VT | Alder Projects',
  description: 'Find home renovation contractors in Windsor County, Vermont — Woodstock, Windsor, Springfield, and surrounding towns. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/windsor-county-vt' },
}
const content = {
  h1: 'Home Renovation Contractors in Windsor County, VT',
  heroImg: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
  intro: 'Find home renovation contractors in Windsor County, Vermont — serving Woodstock, Windsor, Springfield, Ludlow, and surrounding communities.',
  sections: [
    { heading: 'Windsor County Vermont', body: "Windsor County spans from Woodstock's historic village to the Connecticut River valley towns of Windsor and Springfield. The county has Vermont's highest concentration of historic homes and a strong ski and vacation property market near Okemo. Historic renovation, farmhouse restoration, and vacation property upgrades are among the most common project types." },
    { heading: 'What to Expect', body: "Windsor County contractors balance historic renovation expertise with modern construction techniques. Woodstock has a strong local contractor market. Springfield and Windsor have good general contractor availability. Ski property towns near Okemo see strong demand. Many Windsor County homes are historic and require contractors familiar with period-appropriate materials and techniques." },
  ],
  townLinks: [
    { label: 'Woodstock', href: '/woodstock-vt' },
    { label: 'Windsor', href: '/windsor-vt' },
    { label: 'Springfield', href: '/springfield-vt' },
  ],
  faqs: [
    { q: 'What towns does Alder Projects serve in Windsor County?', a: 'We serve all Windsor County towns including Woodstock, Windsor, Springfield, Ludlow, Chester, Cavendish, and surrounding communities.' },
    { q: 'Are there historic preservation requirements for renovation in Woodstock?', a: 'Woodstock has active historic district review for exterior changes. Work within the National Register district requires review. Your contractor should know local requirements.' },
  ],
  ctaText: 'Post Your Project Free →',
  internalLinks: [
    { label: 'Contractors in Rutland County', href: '/rutland-county-vt' },
    { label: 'Contractors in Addison County', href: '/addison-county-vt' },
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
  ],
}
export default function Page() { return <SeoPage content={content} /> }