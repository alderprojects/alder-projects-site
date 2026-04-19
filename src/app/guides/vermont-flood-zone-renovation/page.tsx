import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Renovating in a Vermont Flood Zone: The 50% Rule Explained | Alder Projects',
  description: 'If your Vermont home is in a FEMA flood zone, the substantial improvement rule can turn a kitchen remodel into a foundation project. Here is how it works.',
  alternates: { canonical: 'https://alderprojects.com/guides/vermont-flood-zone-renovation' },
}
const content = {
  eyebrow: 'Seasonal Home Guide', readTime: '5 min',
  h1: 'Renovating in a Vermont Flood Zone',
  intro: "After Tropical Storm Irene in 2011 and the floods of 2023, more Vermont homeowners discovered their property sits in a FEMA-designated flood zone. If yours does, there is a rule you need to understand before spending a dollar on renovation: the substantial improvement rule. It can change everything about your project.",
  sections: [
    { heading: 'The 50% rule, explained simply', body: "FEMA calls it the substantial improvement rule. If the cost of your renovation exceeds 50% of the market value of your building (not the land \u2014 just the structure), then the entire building must be brought into compliance with current floodplain regulations. That can mean raising the structure above the base flood elevation, adding flood venting, or in some cases, rebuilding the foundation entirely. A $40,000 kitchen remodel on a home assessed at $75,000 (structure only) would trigger the rule. Suddenly your project includes engineering, foundation work, and permitting that can double or triple the original scope." },
    { heading: 'How to know if you are in a flood zone', body: "Check the FEMA flood map service center at msc.fema.gov, or run your address through our free Seasonal Home Report \u2014 it queries FEMA data automatically and tells you your zone designation in seconds. Zone A and Zone AE mean you are in the Special Flood Hazard Area. Zone X means you are outside it. Zone A properties require flood insurance if you have a federally backed mortgage." },
    { heading: 'The elevation certificate: your first move', body: "Before planning any renovation in a flood zone, get an elevation certificate. This is a survey document prepared by a licensed surveyor that shows the elevation of your lowest floor relative to the base flood elevation. It costs $300 to $600 and tells you two critical things: how much flood insurance will cost, and how much work would be needed if the substantial improvement rule is triggered. This is the single most important document for a flood zone property." },
    { heading: 'Cumulative improvements: the trap', body: "Some towns track cumulative improvements over a rolling period \u2014 typically 10 years. That means your $20,000 bathroom remodel three years ago counts toward the 50% threshold for your current project. Not every Vermont town tracks this, but many in flood-prone areas do. Check with your town zoning administrator. This conversation is free and takes 10 minutes." },
    { heading: 'What flood insurance costs', body: "For a Vermont home in a Zone A or AE, flood insurance through the National Flood Insurance Program runs roughly $1,000 to $5,000 per year, depending on elevation, structure type, and coverage amount. With an elevation certificate showing your floor is at or above the base flood elevation, the premium drops significantly. Without one, the insurer assumes the worst case." },
    { heading: 'Planning a renovation in a flood zone', body: "The smart approach: get the elevation certificate first. Then model your improvement threshold \u2014 what is 50% of your structure value? Then design your renovation to stay under that number, or plan to go over it intentionally with the full cost of compliance included in the budget. Some homeowners split renovations into phases across multiple years to stay under the threshold. Others decide to go all in, raise the structure, and eliminate the flood risk for good. Both approaches work \u2014 the wrong approach is starting a renovation without knowing the rules." },
  ],
  faqs: [
    { q: "Does the 50% rule apply to all homes in Vermont flood zones?", a: "It applies to all structures in FEMA-designated Special Flood Hazard Areas (zones A, AE, V, VE). Your town floodplain administrator enforces it." },
    { q: "How do I find the market value of just my structure?", a: "Your town grand list separates land value from building value. You can also get an appraisal that isolates the structure." },
    { q: "What happens if I renovate without knowing about the rule?", a: "If the town catches it during permitting or inspection, work can be stopped. If discovered after the fact, the town can require retroactive compliance." },
    { q: "Can I raise my house out of the flood zone?", a: "Yes. House raising in Vermont typically costs $30,000 to $80,000. It permanently reduces flood insurance costs and eliminates the substantial improvement concern." },
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
export default function Page() { return <GuidePage content={content} /> }
