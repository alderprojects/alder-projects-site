import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Home Renovation Contractors Washington County VT | Alder Projects',
  description: 'Find home renovation contractors in Washington County, Vermont — Montpelier, Barre, Waterbury, and surrounding towns. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/washington-county-vt' },
}
const content = {
  h1: 'Home Renovation Contractors in Washington County, VT',
  heroImg: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
  intro: 'Find home renovation contractors in Washington County, Vermont — serving Montpelier, Barre, Waterbury, Northfield, and surrounding communities. Post your project free.',
  sections: [
    { heading: 'Washington County Vermont', body: "Washington County is home to Vermont's capital city Montpelier and the granite city of Barre. The area's housing stock includes Victorian-era homes near downtown Montpelier, granite workers' cottages in Barre, and rural farmhouses throughout the county. Common renovation projects include updating older homes with modern mechanical systems, kitchen and bathroom renovations, and energy efficiency improvements." },
    { heading: 'What to Expect', body: 'Washington County has a solid local contractor market anchored by Montpelier and Barre. Permit requirements vary by municipality. Montpelier has active development review for any exterior changes in historic districts. Most trades book 3 to 6 weeks out.' },
  ],
  townLinks: [
    { label: 'Montpelier', href: '/montpelier-vt' },
    { label: 'Barre', href: '/barre-vt' },
    { label: 'Waterbury', href: '/waterbury-vt' },
  ],
  faqs: [
    { q: 'What towns does Alder Projects serve in Washington County?', a: 'We serve all towns in Washington County including Montpelier, Barre, Waterbury, Northfield, Berlin, Middlesex, Moretown, and surrounding communities.' },
    { q: 'How long do contractors in Washington County book out?', a: 'Quality contractors in Washington County typically book 4 to 8 weeks out for most trades in peak season. Planning ahead is recommended, especially for spring and summer projects.' },
    { q: 'Are there historic district requirements in Montpelier?', a: 'Yes. Montpelier has a Development Review Board that reviews exterior changes in the historic downtown district. Your contractor should be familiar with these requirements.' },
  ],
  ctaText: 'Post Your Project Free →',
  internalLinks: [
    { label: 'Contractors in Chittenden County', href: '/chittenden-county-vt' },
    { label: 'Contractors in Lamoille County', href: '/lamoille-county-vt' },
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
  ],
}
export default function Page() { return <SeoPage content={content} /> }