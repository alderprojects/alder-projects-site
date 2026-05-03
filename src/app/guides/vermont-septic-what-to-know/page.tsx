import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Vermont Septic Systems: What Seasonal Homeowners Should Know | Alder Projects',
  description: 'Septic capacity, inspection costs, pump schedules, and why wetlands matter for your Vermont seasonal home.',
  alternates: { canonical: 'https://alderprojects.com/guides/vermont-septic-what-to-know' },
}
const content = {
  eyebrow: 'Seasonal Home Guide', readTime: '6 min',
  h1: 'Vermont Septic Systems: What Seasonal Owners Should Know',
  intro: "Most seasonal homeowners in Vermont inherit a septic system they have never seen and cannot easily replace. A failed system costs $15,000 to $40,000. Here is what you need to know before it becomes an emergency.",
  ctaHeading: 'Need a septic inspection or upgrade?',
  ctaBody: 'Post your project and we will connect you with a licensed Vermont septic contractor.',
  sections: [
    { heading: 'Why septic matters more for seasonal homes', body: "The bacteria that break down waste need consistent use to stay active. Homes that sit empty for months can see sluggish performance when the owners return and suddenly run showers, laundry, and dishwashers at full capacity." },
    { heading: 'What an inspection actually tells you', body: "A septic inspection in Vermont runs $300 to $500 and includes pumping the tank, checking the baffles and outlet, and evaluating the drain field. The inspector can tell you how full the tank was, whether the baffles are intact, and whether the drain field shows signs of failure." },
    { heading: 'Wetlands change the equation', body: "If your property is near mapped wetlands, the septic system operates in wetter soil. High water tables reduce drain field effectiveness. Our Seasonal Home Report scans your parcel against VT ANR wetland data. If it flags wetlands within 100 meters, getting the septic inspected moves from optional to essential." },
    { heading: 'Capacity and bedrooms: the rule that catches people', body: "Vermont sizes septic systems by the number of bedrooms, not bathrooms. If you convert a den into a guest room, you may be exceeding the permitted capacity. This matters most when you sell \u2014 a buyer inspection will flag the mismatch." },
    { heading: 'Pumping schedule', body: "Vermont recommends pumping every 3 to 5 years for year-round homes. Seasonal homes with lighter use can often go 5 to 7 years. Keep a record. When you have the tank pumped, ask the service to note the sludge and scum levels." },
    { heading: 'What not to do', body: "Do not pour drain cleaners or bleach in large quantities. Do not drive on the drain field. Do not plant trees near the drain field. Do not connect a sump pump or roof drain to the septic system. Do not ignore wet spots or odor in the yard." },
    { heading: 'When to get an inspection', body: "Before any renovation that changes plumbing. Before buying a seasonal home. If the system has not been inspected in five or more years. If you notice slow drains, wet spots, or sewage odor. Before converting to a rental property." },
  ],
  faqs: [
    { q: "How much does a septic inspection cost in Vermont?", a: "Between $300 and $500, including pumping the tank." },
    { q: "How long does a septic system last?", a: "25 to 30 years in good soil. 15 to 20 years near wetlands." },
    { q: "Can I add a bathroom without upgrading my septic?", a: "Adding a bathroom does not change the permitted capacity \u2014 only adding a bedroom does." },
    { q: "What does a new septic system cost in Vermont?", a: "Conventional: $15,000 to $25,000. Mound or engineered: $30,000 to $40,000+." },
  ],
  relatedGuides: [
    { label: 'How to winterize a Vermont seasonal home', href: '/guides/winterizing-vermont-seasonal-home' },
    { label: 'Renovating in a Vermont flood zone', href: '/guides/vermont-flood-zone-renovation' },
    { label: 'Vermont heat pump rebates in 2026', href: '/guides/heat-pump-rebates-vermont' },
  ],
  relatedPages: [
    { label: 'Scan your property', href: '/seasonal-home-report' },
    { label: 'Post a project', href: '/#submit-project' },
    { label: 'Plumbing contractors Vermont', href: '/plumbing-contractors-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} meta={{ path: '/guides/vermont-septic-what-to-know', verifyDate: '2026-05-03' }} /> }
