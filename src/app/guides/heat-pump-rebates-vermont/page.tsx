import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Vermont Heat Pump Rebates in 2026: What You Actually Get Back | Alder Projects',
  description: 'Efficiency Vermont, federal tax credits, and utility rebates for cold-climate heat pumps in 2026. Real numbers and how to stack incentives.',
  alternates: { canonical: 'https://alderprojects.com/guides/heat-pump-rebates-vermont' },
}
const content = {
  eyebrow: 'Seasonal Home Guide', readTime: '5 min',
  h1: 'Vermont Heat Pump Rebates in 2026',
  intro: "Heat pumps are the most popular upgrade for Vermont seasonal homeowners going year-round. The rebate landscape is generous but confusing. Here is what you actually get back in 2026.",
  ctaHeading: 'Ready to install a heat pump?',
  ctaBody: 'Post your project and we will match you with a local Vermont HVAC contractor who handles the rebate paperwork.',
  sections: [
    { heading: 'Efficiency Vermont rebates', body: "Efficiency Vermont offers $800 to $2,000 per cold-climate heat pump. Ductless mini-splits qualify for the full rebate if they meet the cold-climate specification. You must use a participating contractor and submit the application within 90 days. This rebate applies to both primary and secondary homes." },
    { heading: 'Federal 25C tax credit', body: "The federal Energy Efficient Home Improvement Credit covers 30% of qualifying heat pump costs, up to $2,000 per year. This is a tax credit, not a rebate. The system must meet ENERGY STAR Most Efficient specification. No income limit. The credit resets annually. Second homes generally qualify." },
    { heading: 'Stacking the incentives', body: "On a typical $4,500 mini-split install: roughly $1,200 from Efficiency Vermont plus $1,350 from the federal credit \u2014 bringing the effective cost to about $1,950. Green Mountain Power and Vermont Electric Coop sometimes offer additional promotions." },
    { heading: 'What a heat pump does for a seasonal home', body: "A cold-climate heat pump lets you use the house in shoulder seasons without firing up the main heating system. It provides cooling in summer. And it maintains safe winter temperatures on electricity instead of delivered fuel \u2014 saving hundreds per season." },
    { heading: 'What it costs before rebates', body: "Single-zone ductless mini-split installed: $3,500 to $5,500. Multi-zone (2-3 rooms): $7,000 to $12,000. For most seasonal homes, one or two single-zone units in the main living area and primary bedroom is the sweet spot. After rebates: $2,000 to $4,000." },
    { heading: 'Finding a qualified installer', body: "The Efficiency Vermont rebate requires a participating contractor. Look for cold-climate heat pump experience specifically. Ask how many installs they have done and whether they handle the rebate paperwork. Or post your project on Alder Projects and we will match you." },
  ],
  faqs: [
    { q: "Do heat pump rebates apply to second homes?", a: "The Efficiency Vermont rebate applies to any home with an electric account in their territory. The federal credit generally applies to second homes you own." },
    { q: "Can I install a heat pump myself and still get the rebate?", a: "No. A participating contractor is required for the Efficiency Vermont rebate." },
    { q: "Do heat pumps work in Vermont winters?", a: "Cold-climate heat pumps operate efficiently down to -15 degrees Fahrenheit. Standard heat pumps lose efficiency below 30 degrees and are not appropriate for Vermont." },
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
export default function Page() { return <GuidePage content={content} meta={{ path: '/guides/heat-pump-rebates-vermont', verifyDate: '2026-05-03' }} /> }
