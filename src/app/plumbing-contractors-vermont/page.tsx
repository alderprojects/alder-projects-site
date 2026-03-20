import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Plumbing Contractors Vermont | Alder Projects',
  description: 'Find licensed plumbing contractors in Vermont for bathroom remodels, water heater replacement, pipe replacement, and kitchen plumbing. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/plumbing-contractors-vermont' },
}
const content = {
  h1: 'Plumbing Contractors in Vermont',
  heroImg: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1',
  intro: 'Find licensed plumbing contractors in Vermont for bathroom and kitchen remodels, water heater replacement, and whole-home plumbing work. Post free and get matched.',
  sections: [
    { heading: 'Residential Plumbing in Vermont', body: "Vermont's older homes frequently have galvanized steel pipes that corrode over time, reducing water pressure and contaminating water. Replacing galvanized with copper or PEX is one of the most common plumbing projects in Vermont. Water heaters typically need replacement every 8 to 12 years. Vermont's cold winters make freeze protection and proper insulation of pipes in unheated spaces critical." },
    { heading: 'What to Expect', body: 'Plumbing permits are required for any new fixture installation, pipe rerouting, or water heater replacement with a new connection. Your plumber handles permits and inspections. Most plumbing projects in Vermont require 1 to 5 business days depending on scope.' },
  ],
  faqs: [
    { q: 'How much does plumbing cost in Vermont?', a: 'Water heater replacement runs $1,200 to $2,500 installed. Full bathroom plumbing rough-in runs $3,000 to $6,000. Whole-home repiping of galvanized pipes runs $8,000 to $20,000 depending on home size.' },
    { q: 'Do I need a licensed plumber in Vermont?', a: 'Yes. Vermont requires licensed plumbers for all permitted plumbing work. Homeowners can do some plumbing on their own primary residence but work must be inspected.' },
    { q: 'How do I know if my Vermont home has galvanized pipes?', a: 'Galvanized pipes look silver-gray and rust from the inside out. Signs include reduced water pressure, rusty or discolored water, and pipes that are noticeably heavier than modern copper or plastic.' },
  ],
  ctaText: 'Post Your Project Free →',
  internalLinks: [
    { label: 'Bathroom remodeling Vermont', href: '/bathroom-remodeling-vermont' },
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
    { label: 'Contractors in Chittenden County', href: '/chittenden-county-vt' },
  ],
}
export default function Page() { return <SeoPage content={content} /> }