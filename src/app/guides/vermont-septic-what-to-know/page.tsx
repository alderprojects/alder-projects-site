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
  intro: "Most seasonal homeowners in Vermont inherit a septic system they have never seen, do not understand, and cannot easily replace. A failed system costs $15,000 to $40,000 \u2014 and in some locations, the lot cannot support a new one at all. Here is what you need to know before it becomes an emergency.",
  sections: [
    { heading: 'Why septic matters more for seasonal homes', body: "A septic system is a living thing. The bacteria that break down waste need consistent use to stay active. Homes that sit empty for months can see sluggish performance when the owners return and suddenly run showers, laundry, and dishwashers at full capacity. This does not mean the system is broken \u2014 but it does mean the first few weeks of heavy use put the most stress on it." },
    { heading: 'What an inspection actually tells you', body: "A septic inspection in Vermont runs $300 to $500 and includes pumping the tank, checking the baffles and outlet, and evaluating the drain field. The inspector can tell you how full the tank was (which indicates usage vs. capacity), whether the baffles are intact (a broken baffle sends solids into the drain field, which kills it), and whether the drain field shows signs of failure \u2014 wet spots, odor, or surfacing effluent." },
    { heading: 'Wetlands change the equation', body: "If your property is near mapped wetlands \u2014 and many Vermont lakefront and river properties are \u2014 the septic system operates in wetter soil. High water tables reduce drain field effectiveness and can accelerate failure. Our Seasonal Home Report scans your parcel against VT ANR wetland data. If it flags wetlands within 100 meters, getting the septic inspected moves from optional to essential. Replacing a system near wetlands requires a wetland delineation ($1,500 to $5,000) and additional permitting." },
    { heading: 'Capacity and bedrooms: the rule that catches people', body: "Vermont sizes septic systems by the number of bedrooms, not bathrooms. A three-bedroom permit means three bedrooms. If you convert a den into a guest room or finish a basement with a sleeping area, you may be exceeding the permitted capacity. This matters most when you sell \u2014 a buyer inspection will flag the mismatch, and the state may require you to upgrade before transfer." },
    { heading: 'Pumping schedule', body: "Vermont recommends pumping every 3 to 5 years for year-round homes. Seasonal homes with lighter use can often go 5 to 7 years, but this depends on the tank size, the number of people using it during peak season, and whether a garbage disposal is in use. Keep a record. When you have the tank pumped, ask the service to note the sludge and scum levels." },
    { heading: 'What not to do', body: "Do not pour drain cleaners, bleach, or antibacterial products down the drain in large quantities. They kill the bacteria your system depends on. Do not drive or park vehicles on the drain field. Do not plant trees or deep-rooted shrubs near the drain field. Do not connect a sump pump, roof drain, or foundation drain to the septic system. And do not ignore wet spots or odor in the yard." },
    { heading: 'When to get an inspection', body: "Before any renovation that changes plumbing. Before buying a seasonal home (always). If the system has not been inspected in five or more years. If you notice slow drains, gurgling sounds, wet spots in the yard, or sewage odor. And before converting to a rental property \u2014 increased use from weekly turnover guests can exceed the design capacity." },
  ],
  faqs: [
    { q: "How much does a septic inspection cost in Vermont?", a: "Between $300 and $500, which includes pumping the tank." },
    { q: "How long does a septic system last?", a: "A well-maintained system in good soil can last 25 to 30 years. In wet soils or near wetlands, 15 to 20 years is more typical." },
    { q: "Can I add a bathroom without upgrading my septic?", a: "Adding a bathroom does not change the permitted capacity \u2014 only adding a bedroom does. But if the system is already near capacity, the additional water load can stress it." },
    { q: "What does a new septic system cost in Vermont?", a: "A conventional system runs $15,000 to $25,000. Mound systems or engineered systems for difficult sites can reach $30,000 to $40,000 or more." },
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
export default function Page() { return <GuidePage content={content} /> }
