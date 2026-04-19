import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Winterizing a Lake House in Vermont: What to Do First | Alder Projects',
  description: 'Step-by-step winterizing sequence for Vermont lake houses. What breaks, what to protect first, and the mistakes that cost thousands.',
  alternates: { canonical: 'https://alderprojects.com/guides/winterizing-lake-house-vermont' },
}
const content = {
  eyebrow: 'Decision Guide', readTime: '5 min',
  h1: 'Winterizing a Lake House in Vermont',
  intro: "Start with the water. A single burst pipe in an empty lakehouse runs for days before anyone notices — average damage in Vermont: $12,000. Everything else matters, but nothing matters as much as draining the plumbing or keeping the heat above 55 degrees. Do that first, then work down the list.",
  ctaHeading: 'Need help closing up for winter?',
  ctaBody: 'Describe what you need. We match you with someone local who does this work.',
  sections: [
    { heading: 'What actually matters', body: 'Five things determine whether you come back to a functioning house or a disaster. Everything else is maintenance.', list: [
      'Plumbing: undrained pipes burst. Period. A plumber blowout costs $200. A burst pipe costs $12,000. The math is not complicated.',
      'Heat: below 50 degrees, condensation forms inside walls. Mold starts in 48 hours. Wood warps. Set the thermostat to 55 and leave it.',
      'Septic: if your system sits idle for five months, bacteria die off. Come spring, you flush a full house into a sluggish system. Pump before closing if it has been 3+ years.',
      'Pests: mice move in the day you leave. One mouse chews one wire and you have a fire risk or a dead furnace. Seal every penetration. Steel wool and foam at the foundation line.',
      'Insurance: most Vermont policies require periodic checks on vacant homes — often every 72 hours. If your insurer does not know the house is empty, a claim gets denied. Call them before you leave.'
    ]},
    { heading: 'What people get wrong', body: 'These mistakes cost Vermont lake house owners thousands every year. All of them are avoidable.', list: [
      'Draining the house but skipping the traps. Water in sink and toilet traps prevents sewer gas from entering the house. After draining, pour RV antifreeze into every trap — sinks, showers, toilets, washing machine drain.',
      'Turning off the heat entirely. Saved $300 in propane, spent $8,000 on mold remediation and warped hardwood. The furnace stays on.',
      'Leaving food anywhere. Not just the fridge. A single granola bar in a drawer is an invitation. Mice do not need much.',
      'Ignoring the dock. Vermont ANR and most lake associations have specific pullout timelines. Miss the window and you face fines or ice damage. Check your town rules before November.'
    ]},
    { heading: 'What to do first (in order)', body: "This sequence matters. Each step either prevents the most expensive failure or unlocks the next step. Do not skip around.

1. Drain the plumbing or set heat to 55. This is the single decision that determines whether you come back to a house or a construction site. If draining, hire a plumber to blow out the lines with compressed air. If keeping heat on, install a Wi-Fi temperature sensor so you know if the furnace dies.

2. Shut off and drain exterior water. Outdoor faucets, garden hoses, irrigation lines. These freeze first because they have no wall insulation protecting them. Disconnect hoses from bibs.

3. Seal the envelope. Foundation penetrations, pipe entries, dryer vents, chimney. Steel wool and expanding foam for holes. A chimney cap prevents animals from nesting in the flue.

4. Secure the dock and waterfront. Follow your town and ANR requirements. Some lakes require docks out by December 1. Others allow seasonal docks to remain if properly anchored.

5. Set up remote monitoring. A $30 Wi-Fi leak sensor and a $100 smart thermostat give you eyes on the house all winter. You get a phone alert if the temperature drops or water appears. This is the cheapest insurance you will ever buy." },
    { heading: 'What not to do yet', body: 'Resist the urge to do everything at once. These are important but cause problems if done in the wrong order.', list: [
      'Do not schedule spring renovation work before confirming the house survived winter. A January ice dam can change your roofing scope entirely. Wait until you open in April to plan summer projects.',
      'Do not close the damper until the chimney is capped. An uncapped chimney with a closed damper traps moisture and animals inside the flue. Cap first, then close.',
      'Do not winterize the septic without checking the pump schedule. If it is due for pumping, pump before closing — not after five months of sitting.'
    ]},
    { heading: 'Want this checked for your property?', body: "Run your address through our free Seasonal Home Report. It scans your parcel against Vermont state records — flood zones, wetlands, shoreland buffers — and tells you what matters for your specific property. Takes 10 seconds." },
    { heading: 'How owners typically handle this', body: "Three common approaches, depending on how hands-on you want to be.

DIY close-up: Buy the sensors, antifreeze, and steel wool. Do the walkthrough yourself on closing weekend. Total cost: $100–$300 in supplies.

Handyman day visit: A local handyman does everything in one trip — installs sensors, seals pests, insulates pipes, cleans gutters, checks the furnace. $400–$800 for a full day.

Full-service winterization: A contractor or property manager handles everything including plumber blowout, dock removal, and insurance coordination. $800–$1,500." },
  ],
  faqs: [
    { q: 'When should I winterize my Vermont lake house?', a: 'By mid-October. The Northeast Kingdom sees hard freezes in early October. Stowe, Greensboro, and northern lakes should close by Columbus Day weekend.' },
    { q: 'Can I just drain everything and turn off the heat?', a: 'You can, but it requires a professional plumber blowout ($150–$300). Miss one trap or valve and you have a freeze. Most owners keep heat at 55 and install a remote sensor.' },
    { q: 'Do I need to pull my dock?', a: 'Depends on your lake and town. Check with your town clerk and Vermont ANR. Some lakes require removal by a specific date. Ice can destroy a dock left in.' },
  ],
  relatedGuides: [
    { label: 'Opening a lake house for summer', href: '/guides/opening-lake-house-summer-vermont' },
    { label: 'Can I add a bedroom to my lake house?', href: '/guides/can-i-add-bedroom-vermont-lake-house' },
    { label: 'Vermont septic systems for seasonal owners', href: '/guides/vermont-septic-what-to-know' },
  ],
  relatedPages: [
    { label: 'Scan your property', href: '/seasonal-home-report' },
    { label: 'Post a project', href: '/#submit-project' },
    { label: 'What a handyman can do', href: '/guides/handyman-seasonal-home-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }
