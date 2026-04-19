import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'How to Winterize a Vermont Seasonal Home | Alder Projects',
  description: 'A room-by-room checklist for closing your Vermont lake house or cabin for winter. Covers pipes, heating, pests, septic, and the things most people forget.',
  alternates: { canonical: 'https://alderprojects.com/guides/winterizing-vermont-seasonal-home' },
}
const content = {
  eyebrow: 'Seasonal Home Guide', readTime: '7 min',
  h1: 'How to Winterize a Vermont Seasonal Home',
  intro: "Vermont freezes hard \u2014 sometimes by mid-October in the Northeast Kingdom, reliably by Thanksgiving everywhere else. If your seasonal home sits empty through winter, the cost of skipping a step is measured in thousands, not inconvenience.",
  ctaHeading: 'Ready to get your seasonal home in shape?',
  ctaBody: 'Post your project and we will match you with a local Vermont contractor who knows seasonal properties.',
  sections: [
    { heading: 'Pipes: the one that costs the most when you skip it', body: "A burst pipe in an unoccupied home can run for days before anyone notices. Average cleanup cost in Vermont: $8,000 to $15,000. Set your thermostat to 55 degrees minimum. If draining the system, hire a plumber to blow out the lines with compressed air. Disconnect outdoor hoses and shut off exterior faucets from inside. Install Wi-Fi leak and freeze sensors \u2014 a $30 sensor is the single best investment in this entire checklist." },
    { heading: 'Heating: keep it on, but keep it smart', body: "Never turn off the heat entirely. Condensation forms inside walls, mold grows, and wood cracks. Set the thermostat to 55 degrees. A smart thermostat lets you monitor remotely. If your home runs on propane or oil, schedule a delivery before closing up. Have the furnace serviced in September or October \u2014 technicians are booked solid by November." },
    { heading: 'Pests: they move in the day you leave', body: "Mice can squeeze through a hole the size of a dime. Steel wool and expanding foam around pipe penetrations, foundation cracks, and where utilities enter the house. A chimney cap prevents squirrels, raccoons, and birds from nesting in the flue. Remove all food \u2014 not just perishables." },
    { heading: 'Water and septic: close it up right', body: "Pour RV antifreeze into every drain trap \u2014 sinks, showers, toilets, and the washing machine drain. If your home is on a septic system, note when it was last pumped. Vermont recommends pumping every 3 to 5 years. If you are planning spring renovations that change plumbing, get it inspected before you close up." },
    { heading: 'The exterior: 30 minutes that prevents spring surprises', body: "Clean the gutters. Inspect the roof from the ground for missing or lifted shingles. Trim branches that overhang the roof. Drain and store garden hoses. If you have a dock, follow your town and ANR requirements for winter storage." },
    { heading: 'Inside: the things people forget', body: "Clean out the refrigerator completely. Unplug it, defrost the freezer, wipe it dry, and prop the door open. Strip the beds and store linens in sealed plastic bins. Close the fireplace damper. Unplug all electronics. Take photos of every room before you leave \u2014 invaluable for insurance claims." },
    { heading: 'Tell your insurance company', body: "Many homeowners insurance policies require that a vacant home be checked periodically \u2014 sometimes every 72 hours. If your insurer does not know the home will be unoccupied, a claim could be denied. Call your agent and confirm the vacancy requirements." },
    { heading: 'Scan your property for free', body: "Run your address through our free Seasonal Home Report. It scans your parcel against state environmental records \u2014 flood zones, wetlands, shoreland buffers \u2014 and tells you what matters for your specific property." },
  ],
  faqs: [
    { q: "When should I winterize my Vermont seasonal home?", a: "Ideally by mid-October. The Northeast Kingdom can see hard freezes in early October." },
    { q: "Can I just drain the pipes instead of keeping the heat on?", a: "You can, but it requires a professional air blowout. Most seasonal owners drain exterior lines and keep interior heat on low." },
    { q: "How much does it cost to winterize a seasonal home?", a: "DIY supplies cost under $200. Plumber blowout runs $150 to $300. Full-service winterization is $300 to $600." },
    { q: "What temperature should I leave the thermostat at?", a: "55 degrees Fahrenheit. Below 50 and you risk frozen pipes in exterior walls." },
  ],
  relatedGuides: [
    { label: 'Vermont septic systems for seasonal owners', href: '/guides/vermont-septic-what-to-know' },
    { label: 'Renovating in a Vermont flood zone', href: '/guides/vermont-flood-zone-renovation' },
    { label: 'Vermont heat pump rebates in 2026', href: '/guides/heat-pump-rebates-vermont' },
  ],
  relatedPages: [
    { label: 'Scan your property', href: '/seasonal-home-report' },
    { label: 'Post a project', href: '/#submit-project' },
    { label: 'Roofing contractors Vermont', href: '/roofing-contractors-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }
