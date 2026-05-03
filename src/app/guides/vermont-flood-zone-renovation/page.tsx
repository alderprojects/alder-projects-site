import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Renovating in a Vermont Flood Zone: The 50% Rule Explained | Alder Projects',
  description: 'If your Vermont home is in a FEMA flood zone, the substantial improvement rule can turn a kitchen remodel into a foundation project.',
  alternates: { canonical: 'https://alderprojects.com/guides/vermont-flood-zone-renovation' },
}
const content = {
  eyebrow: 'Seasonal Home Guide', readTime: '5 min',
  h1: 'Renovating in a Vermont Flood Zone',
  intro: "After Tropical Storm Irene and the floods of 2023, more Vermont homeowners discovered their property sits in a FEMA flood zone. If yours does, there is a rule you need to understand before spending a dollar on renovation.",
  ctaHeading: 'Planning a renovation in a flood zone?',
  ctaBody: 'Post your project and we will match you with a Vermont contractor experienced in flood zone compliance.',
  sections: [
    { heading: 'The 50% rule, explained simply', body: "If the cost of your renovation exceeds 50% of the market value of your building (not the land), then the entire building must be brought into compliance with current floodplain regulations. That can mean raising the structure above the base flood elevation. A $40,000 kitchen remodel on a home assessed at $75,000 (structure only) would trigger the rule." },
    { heading: 'How to know if you are in a flood zone', body: "Check the FEMA flood map at msc.fema.gov, or run your address through our free Seasonal Home Report \u2014 it queries FEMA data automatically. Zone A and AE mean you are in the Special Flood Hazard Area. Zone X means you are outside it." },
    { heading: 'The elevation certificate: your first move', body: "Before planning any renovation in a flood zone, get an elevation certificate. This survey document costs $300 to $600 and tells you how much flood insurance will cost and how much work would be needed if the 50% rule is triggered." },
    { heading: 'Cumulative improvements: the trap', body: "Some towns track cumulative improvements over a rolling period \u2014 typically 10 years. Your bathroom remodel three years ago counts toward the threshold for your current project. Check with your town zoning administrator." },
    { heading: 'What flood insurance costs', body: "For a Vermont home in Zone A or AE, flood insurance runs roughly $1,000 to $5,000 per year. With an elevation certificate showing your floor at or above the base flood elevation, the premium drops significantly." },
    { heading: 'Planning a renovation in a flood zone', body: "Get the elevation certificate first. Then model your improvement threshold. Design your renovation to stay under 50%, or plan to go over with compliance costs included. The wrong approach is starting without knowing the rules." },
  ],
  faqs: [
    { q: "Does the 50% rule apply to all homes in Vermont flood zones?", a: "It applies to all structures in FEMA Special Flood Hazard Areas (zones A, AE, V, VE)." },
    { q: "How do I find the market value of just my structure?", a: "Your town grand list separates land value from building value." },
    { q: "Can I raise my house out of the flood zone?", a: "Yes. House raising in Vermont typically costs $30,000 to $80,000. It permanently reduces flood insurance costs." },
  ],
  relatedGuides: [
    { label: 'How to winterize a Vermont seasonal home', href: '/guides/winterizing-vermont-seasonal-home' },
    { label: 'Vermont septic systems for seasonal owners', href: '/guides/vermont-septic-what-to-know' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
  ],
  relatedPages: [
    { label: 'Scan your property', href: '/seasonal-home-report' },
    { label: 'Post a project', href: '/#submit-project' },
    { label: 'General contractors Vermont', href: '/general-contractors-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} meta={{ path: '/guides/vermont-flood-zone-renovation', verifyDate: '2026-05-03' }} /> }
