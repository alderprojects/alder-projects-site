import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Electrical Contractors Vermont | Alder Projects',
  description: 'Find licensed electrical contractors in Vermont. Panel upgrades, EV chargers, whole-home rewiring, and new construction. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/electrical-contractors-vermont' },
}
const content = {
  h1: 'Electrical Contractors in Vermont',
  heroImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  intro: 'Find licensed electrical contractors in Vermont for panel upgrades, rewiring, EV charger installation, and new construction. Post free and get matched with local electricians.',
  sections: [
    { heading: 'Residential Electrical Work in Vermont', body: 'Vermont homes range from colonial-era farmhouses with knob-and-tube wiring to new construction with smart home systems. Common electrical projects include panel upgrades to 200-amp service, rewiring older homes, adding circuits for modern appliances, EV charger installation, and generator hookups. All electrical work in Vermont requires a licensed master or journeyman electrician and permit inspection.' },
    { heading: 'What to Expect', body: 'Electrical permits are required for all new circuits, panel work, and major rewiring in Vermont. Permits are reviewed and inspected by the municipality. Most panel upgrades complete in 1 to 2 days. Whole-home rewiring is a multi-week project. Your contractor pulls the permit and schedules inspections as part of the job.' },
  ],
  faqs: [
    { q: 'Do I need a licensed electrician in Vermont?', a: 'Yes. Vermont requires licensed electricians for all permitted electrical work. Homeowners can do some work on their own primary residence, but it must pass inspection.' },
    { q: 'How much does a panel upgrade cost in Vermont?', a: 'A standard 200-amp service upgrade runs $2,500 to $5,000 in Vermont, depending on the complexity of the work and local utility coordination.' },
    { q: 'How long does electrical work take?', a: 'Panel upgrades typically complete in 1 to 2 days. EV charger installation is usually 2 to 4 hours. Whole-home rewiring is a 2 to 4 week project.' },
  ],
  ctaText: 'Post Your Project Free →',
  internalLinks: [
    { label: 'Electrical contractors Burlington', href: '/electrical-contractors-burlington-vt' },
    { label: 'Contractors in Chittenden County', href: '/chittenden-county-vt' },
    { label: 'Home additions Vermont', href: '/home-additions-vermont' },
  ],
}
export default function Page() { return <SeoPage content={content} /> }