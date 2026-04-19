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
  intro: "Vermont freezes hard \u2014 sometimes by mid-October in the Northeast Kingdom, reliably by Thanksgiving everywhere else. If your seasonal home sits empty through winter, the cost of skipping a step is measured in thousands, not inconvenience. This is the complete checklist, organized by what actually goes wrong when people cut corners.",
  sections: [
    { heading: 'Pipes: the one that costs the most when you skip it', body: "A burst pipe in an unoccupied home can run for days before anyone notices. Average cleanup cost in Vermont: $8,000 to $15,000, and that is before repairing the pipe itself. Set your thermostat to 55 degrees minimum. If you are draining the system entirely, hire a plumber to blow out the lines with compressed air. Disconnect and drain outdoor hoses and shut off exterior faucets from inside. Open cabinet doors under sinks on exterior walls so heated air reaches the pipes. For extra protection, install Wi-Fi-enabled leak and freeze sensors. A $30 sensor that texts you when the temperature drops below 40 degrees is the single best investment in this entire checklist." },
    { heading: 'Heating: keep it on, but keep it smart', body: "Never turn off the heat entirely. Even if you drain the plumbing, the structure itself suffers \u2014 condensation forms inside walls, mold grows, and wood swells and contracts in ways that crack finishes. Set the thermostat to 55 degrees and leave it. A smart thermostat lets you monitor remotely and alerts you if the system fails. If your home runs on propane or oil, schedule a delivery before closing up. Running out of fuel mid-January when nobody is there is an emergency you want to prevent, not react to." },
    { heading: 'Pests: they move in the day you leave', body: "Mice can squeeze through a hole the size of a dime. They will find your seasonal home within days of you leaving. Steel wool and expanding foam around pipe penetrations, foundation cracks, and where utilities enter the house. A chimney cap prevents squirrels, raccoons, and birds from nesting in the flue. Remove all food \u2014 not just perishables. Mice will gnaw through cereal boxes, pasta packaging, and even soap." },
    { heading: 'Water and septic: close it up right', body: "Pour RV antifreeze into every drain trap \u2014 sinks, showers, toilets, and the washing machine drain. This prevents the trap from drying out (which lets sewer gas into the house) and protects the trap from freezing. If your home is on a septic system, this is a good time to note when it was last pumped. Vermont recommends pumping every 3 to 5 years. If you are planning spring renovations that change plumbing, get it inspected before you close up." },
    { heading: 'The exterior: 30 minutes that prevents spring surprises', body: "Clean the gutters \u2014 Vermont leaf fall clogs them completely, and ice dams form behind the clog. If you are tired of doing this annually, gutter guards are a one-time fix. Inspect the roof from the ground for missing or lifted shingles. Trim any branches that overhang the roof. Drain and store garden hoses. If you have a dock, follow your town and ANR requirements for winter storage." },
    { heading: 'Inside: the things people forget', body: "Clean out the refrigerator completely. Unplug it, defrost the freezer, wipe it dry, and prop the door open with a towel. A closed, unplugged fridge grows mold that can make the appliance unsalvageable. Strip the beds and store linens in sealed plastic bins. Close the fireplace damper. Unplug all electronics. Finally, take photos of every room before you leave \u2014 invaluable for insurance claims." },
    { heading: 'One more thing: tell your insurance company', body: "Many homeowners insurance policies require that a vacant home be checked periodically \u2014 sometimes every 72 hours. If your insurer does not know the home will be unoccupied for months, a claim could be denied. Call your agent, confirm the vacancy requirements, and arrange for a neighbor or property manager to do regular checks." },
    { heading: 'Scan your property for free', body: "Before you close up, run your address through our free Seasonal Home Report. It scans your parcel against state environmental records \u2014 flood zones, wetlands, shoreland buffers \u2014 and tells you what matters for your specific property. It takes 10 seconds and might flag something you did not know about." },
  ],
  faqs: [
    { q: "When should I winterize my Vermont seasonal home?", a: "Ideally by mid-October. The Northeast Kingdom can see hard freezes in early October, and scheduling plumbers and heating technicians gets difficult after Halloween." },
    { q: "Can I just drain the pipes instead of keeping the heat on?", a: "You can, but it requires a professional air blowout to be truly safe. Even then, keeping the heat at 55 degrees protects the structure itself from moisture damage." },
    { q: "How much does it cost to winterize a seasonal home?", a: "If you do it yourself, under $200. Hiring a plumber to blow out lines runs $150 to $300. Full-service winterization from a property manager is $300 to $600." },
    { q: "What temperature should I leave the thermostat at?", a: "55 degrees Fahrenheit. Below 50 and you risk frozen pipes in exterior walls. Smart thermostats with freeze alerts add protection for $100 to $200." },
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
