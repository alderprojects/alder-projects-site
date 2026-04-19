import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Vermont Heat Pump Rebates in 2026: What You Actually Get Back | Alder Projects',
  description: 'Efficiency Vermont, federal tax credits, and utility rebates for cold-climate heat pumps in 2026. Real numbers, eligibility rules, and how to stack incentives.',
  alternates: { canonical: 'https://alderprojects.com/guides/heat-pump-rebates-vermont' },
}
const content = {
  eyebrow: 'Seasonal Home Guide', readTime: '5 min',
  h1: 'Vermont Heat Pump Rebates in 2026',
  intro: "Heat pumps are the single most popular upgrade for Vermont seasonal homeowners turning a three-season property into a year-round one. The rebate landscape is generous but confusing \u2014 state, federal, and utility incentives stack, but each has different rules. Here is what you actually get back in 2026.",
  sections: [
    { heading: 'Efficiency Vermont rebates', body: "Efficiency Vermont offers $800 to $2,000 per cold-climate heat pump for qualifying installations. The exact amount depends on the system type and whether you are displacing fossil fuel heating. Ductless mini-splits \u2014 the most common choice for seasonal homes \u2014 qualify for the full rebate if they meet the cold-climate specification (they must perform efficiently down to 5 degrees Fahrenheit). To get the rebate, you must use an Efficiency Vermont participating contractor and submit the application within 90 days of installation. This rebate applies to both primary and secondary homes." },
    { heading: 'Federal 25C tax credit', body: "The federal Energy Efficient Home Improvement Credit (Section 25C) covers 30% of the cost of qualifying heat pumps, up to $2,000 per year. This is a tax credit, not a rebate \u2014 it reduces your tax bill dollar for dollar, but you need to have at least that much tax liability to claim it. The system must meet the ENERGY STAR Most Efficient specification. There is no income limit. The credit resets annually. For seasonal homes: the property must be in the United States and the system must serve a dwelling you own. Second homes generally qualify, but consult your tax advisor." },
    { heading: 'Stacking the incentives', body: "The Efficiency Vermont rebate and the federal tax credit can be combined. On a typical cold-climate mini-split system costing $4,500 installed, the math works out to roughly $1,200 from Efficiency Vermont plus $1,350 from the federal credit (30% of $4,500) \u2014 bringing the effective cost down to about $1,950. Some utility companies offer additional incentives on top of these. Green Mountain Power and Vermont Electric Coop both run periodic promotions. Check with your utility before scheduling the installation." },
    { heading: 'What a heat pump actually does for a seasonal home', body: "The real value for a seasonal homeowner is not just heating \u2014 it is flexibility. A cold-climate heat pump lets you use the house comfortably in shoulder seasons (April, May, October, November) without firing up the main heating system. It provides cooling in summer when Vermont heat and humidity hit. And it maintains a safe minimum temperature in winter to protect pipes, all while running on electricity instead of delivered fuel. For a Greensboro or Stowe seasonal home, the difference between leaving the oil furnace at 55 degrees all winter and letting a heat pump handle it quietly is hundreds of dollars per season." },
    { heading: 'What it costs before rebates', body: "A single-zone ductless mini-split, installed: $3,500 to $5,500. A multi-zone system serving 2 to 3 rooms: $7,000 to $12,000. A whole-home ducted system: $12,000 to $20,000. For most seasonal homes, one or two single-zone units in the main living area and primary bedroom is the sweet spot. You keep your existing heating system as backup, add the heat pump for daily use and shoulder season comfort, and the rebates bring the effective cost to roughly $2,000 to $4,000." },
    { heading: 'Finding a qualified installer', body: "The Efficiency Vermont rebate requires a participating contractor. Most established HVAC contractors in Vermont are already on the list. Look for contractors with cold-climate heat pump experience specifically \u2014 a system designed for North Carolina performs differently in a Vermont January. Ask how many cold-climate installs they have done, whether they handle the rebate paperwork, and what their warranty covers. Or post your project on Alder Projects and we will match you with a local installer who does this work." },
  ],
  faqs: [
    { q: "Do heat pump rebates apply to second homes in Vermont?", a: "The Efficiency Vermont rebate applies to any home with an electric account in their service territory. The federal 25C credit generally applies to second homes you own, though you should confirm with your tax advisor." },
    { q: "Can I install a heat pump myself and still get the rebate?", a: "No. The Efficiency Vermont rebate requires a participating contractor for installation." },
    { q: "How long does it take to get the rebate?", a: "Efficiency Vermont typically processes rebates within 4 to 6 weeks after submission. The federal tax credit is claimed on your annual tax return." },
    { q: "Do heat pumps work in Vermont winters?", a: "Cold-climate heat pumps are rated to operate efficiently down to -15 degrees Fahrenheit or below. They are the standard recommendation for Vermont. Standard heat pumps lose efficiency below 30 degrees and are not appropriate here." },
  ],
  relatedGuides: [
    { label: 'How to winterize a Vermont seasonal home', href: '/guides/winterizing-vermont-seasonal-home' },
    { label: 'Vermont septic systems for seasonal owners', href: '/guides/vermont-septic-what-to-know' },
    { label: 'Renovating in a Vermont flood zone', href: '/guides/vermont-flood-zone-renovation' },
  ],
  relatedPages: [
    { label: 'Scan your property', href: '/seasonal-home-report' },
    { label: 'Post a project', href: '/#submit-project' },
    { label: 'HVAC contractors Vermont', href: '/hvac-contractors-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }
