import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Electrical Contractors Burlington VT | Alder Projects',
  description: 'Find licensed electrical contractors in Burlington and Chittenden County. Panel upgrades, EV chargers, rewiring. Post your project free.',
  alternates: { canonical: 'https://alderprojects.com/electrical-contractors-burlington-vt' },
}
const content = {
  h1: 'Electrical Contractors in Burlington, VT',
  heroImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  intro: 'Find licensed electrical contractors in Burlington and Chittenden County. Post free and get matched with local electricians.',
  sections: [
    { heading: 'Electrical Work in Burlington', body: "Burlington's housing stock spans Victorian homes in the Hill district, triple-deckers on the South End, and newer construction near UVM. Older homes commonly need panel upgrades from 100-amp to 200-amp service, knob-and-tube replacement, and additional circuits for modern kitchens and EV chargers. Burlington has an active EV charger incentive program through Green Mountain Power." },
    { heading: 'What to Expect', body: 'Burlington electrical permits are issued through the Department of Planning and Zoning. Inspections are required for all new circuits and panel work. Most Burlington electricians are booked 2 to 4 weeks out for standard projects.' },
  ],
  faqs: [
    { q: 'How much does electrical work cost in Burlington, VT?', a: 'Panel upgrades run $2,500 to $5,000. EV charger installation runs $800 to $2,000 depending on panel capacity and distance. Whole-home rewiring starts around $15,000 for a typical Burlington home.' },
    { q: 'Are there EV charger incentives in Burlington?', a: 'Yes. Green Mountain Power offers rebates for Level 2 EV charger installation. Ask your electrician about current programs when getting quotes.' },
    { q: 'Do I need a permit for electrical work in Burlington?', a: 'Yes. All electrical work beyond simple fixture replacement requires a permit through Burlington Planning and Zoning.' },
  ],
  ctaText: 'Post Your Project Free →',
  internalLinks: [
    { label: 'Electrical contractors Vermont', href: '/electrical-contractors-vermont' },
    { label: 'Contractors in Chittenden County', href: '/chittenden-county-vt' },
    { label: 'Kitchen remodeling Burlington', href: '/kitchen-remodeling-burlington-vt' },
  ],
}
export default function Page() { return <SeoPage content={content} /> }