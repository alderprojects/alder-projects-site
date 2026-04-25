import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: 'Winterizing a Lake House in Vermont | Alder Projects',
  description: 'Lake-specific winterizing for Vermont. Docks, water intake, shore erosion, pipes, septic.',
  alternates: { canonical: 'https://alderprojects.com/guides/winterizing-lake-house-vermont' },
}

const content = {
  eyebrow: 'Seasonal Home Guide',
  readTime: '6 min',
  h1: 'Winterizing a Lake House in Vermont',
  intro: 'A lake house has everything a regular seasonal home has plus a shoreline, a dock, a water intake, and soil that stays wet longer than inland properties. Miss the lake-specific steps and you come back to a collapsed dock, a frozen intake line, and shoreline erosion that costs more to fix than to prevent.',
  ctaHeading: 'Need someone to close up your lake house this fall?',
  ctaBody: 'Post your project. We match you with local Vermont pros who handle seasonal close-downs.',
  sections: [
    {
      heading: 'What actually matters at a lake house',
      body: 'Everything from a standard winterizing checklist applies. These are the lake-specific items that most checklists miss.',
      list: [
        'Dock removal and storage. Vermont ice heaves docks. If your dock stays in the water, ice expansion can twist frames, snap posts, and push cribs into the lakebed.',
        'Water intake line. If your house draws water from the lake, the intake line must be drained, disconnected, and sealed. A frozen intake line cracks underground. Spring repair means excavation: $2,000 to $8,000.',
        'Shoreline erosion protection. Fall storms and spring ice push are when most lakefront erosion happens.',
        'Sump pump and drainage. Lake houses sit in wetter soil. If your sump pump runs year-round, it must keep running through winter.',
        'Boat and watercraft storage. Anything left on or near the water freezes, cracks, or drifts.',
      ],
    },
    {
      heading: 'What lake house owners get wrong',
      body: 'These mistakes are specific to lakefront properties.',
      list: [
        'Leaving the dock in because it seems fine. Vermont lake ice can exert tens of thousands of pounds of lateral force. Every dock comes out, every year.',
        'Draining the house pipes but forgetting the lake intake. The intake line runs underground from the pump house to the lake. One freeze cycle cracks it.',
        'Not disconnecting the outdoor shower. Lake houses with outdoor showers have supply lines running through exterior walls. These freeze first.',
        'Leaving the boat battery connected. A dead marine battery in a cold boat cracks its case. Disconnect terminals, bring the battery indoors.',
      ],
    },
    {
      heading: 'What to do first, in order',
      body: 'The sequence matters because some steps depend on others.',
      list: [
        '1. Check dock removal deadlines. Call your town clerk. Some towns require docks out by October 15.',
        '2. Remove the dock and store it above the high-water mark. Disassemble sections and label hardware.',
        '3. Winterize the water intake. Shut off the lake pump, drain the intake line, disconnect and cap it.',
        '4. Drain and blow out interior plumbing. Shut the main valve, open all faucets, flush toilets. Pour RV antifreeze into every drain trap.',
        '5. Set the thermostat to 55 degrees. Install a Wi-Fi thermostat to monitor remotely.',
        '6. Secure the shoreline. Check retaining walls for new cracks. Consider temporary erosion blankets.',
        '7. Winterize watercraft. Drain motors, stabilize fuel, remove batteries. Store boats under cover.',
      ],
    },
    {
      heading: 'What not to do yet',
      body: 'Timing matters for lake-specific tasks.',
      list: [
        'Do not haul the dock out after the first hard frost. The ground near the shore gets slippery. Early October is the window.',
        'Do not leave the sump pump circuit off if your basement has any history of water. A dead sump pump means a flooded basement by April.',
        'Do not apply shoreline plantings in late fall. Install erosion blankets now; plant in spring.',
      ],
    },
    {
      heading: 'Want this tailored to your property?',
      body: 'Run your address through our free Seasonal Home Report. It checks your parcel against state environmental records and tells you which factors affect your property. Takes 10 seconds.',
    },
    {
      heading: 'How most lake house owners handle this',
      body: 'DIY: follow the sequence above over a long weekend. Budget $100 to $300 in supplies plus your time on the dock. Handyman plus dock crew: a handyman does the house ($300 to $600) and a dock service handles removal ($200 to $800). Total: $500 to $1,400. Full seasonal management: a property manager handles close-down, monthly checks, and spring opening. Expect $2,000 to $4,000 per season.',
    },
  ],
  faqs: [
    { q: 'When should I winterize my Vermont lake house?', a: 'Early to mid-October. Dock removal should happen before the first hard frost.' },
    { q: 'Can I leave my dock in the lake over winter?', a: 'Not recommended. Vermont lake ice exerts enormous lateral force. Most towns require removal.' },
    { q: 'What if I use the lake house on occasional winter weekends?', a: 'Keep the heat at 55 degrees year-round. Do not drain the plumbing if you visit monthly. The dock still comes out.' },
  ],
  relatedGuides: [
    { label: 'How to winterize a Vermont seasonal home', href: '/guides/winterizing-vermont-seasonal-home' },
    { label: 'Opening a lake house for summer in Vermont', href: '/guides/opening-lake-house-summer-vermont' },
    { label: 'What a handyman can do for your seasonal home', href: '/guides/handyman-seasonal-home-vermont' },
  ],
  relatedPages: [
    { label: 'Scan your property', href: '/seasonal-home-report' },
    { label: 'Post a project', href: '/#submit-project' },
  ],
}

export default function Page() {
  return <GuidePage content={content} />
}
