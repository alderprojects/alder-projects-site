import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'How Much Does a Roof Replacement Cost in Vermont? | Alder Projects',
  description: 'Vermont roof replacement costs by material — asphalt shingles vs metal vs standing seam. Ice dam considerations and timing.',
  alternates: { canonical: 'https://alderprojects.com/guides/how-much-does-roof-replacement-cost-vermont' },
}
const content = {
  eyebrow: 'Cost Guide', readTime: '5 min',
  h1: 'How Much Does a Roof Replacement Cost in Vermont?',
  intro: 'Vermont roofing costs are shaped by the state's harsh winters. Material choice matters more here than in most states — and the wrong choice can mean significant ice dam damage within a few seasons.',
  sections: [
    { heading: 'Asphalt shingles: $8,000 to $20,000', body: 'The most common choice for Vermont homes, asphalt shingles balance cost and performance. A 1,500 square foot ranch in Burlington typically runs $9,000 to $13,000 fully installed. Larger or steeper homes push higher. Architectural shingles are worth the modest premium over 3-tab — they handle Vermont wind loads better and carry longer warranties.' },
    { heading: 'Metal roofing: $15,000 to $40,000', body: 'Metal roofing is increasingly popular in Vermont for good reason — it sheds snow naturally, resists ice dams, and typically lasts 40 to 70 years. Standing seam metal is the premium option at $20,000 to $40,000 for most homes. Steel panels are a cost-effective mid-range at $15,000 to $25,000. The higher upfront cost makes sense on a home you plan to own long-term.', list: ['Standing seam metal: $600 to $900 per square (100 sq ft)', 'Steel panels: $400 to $600 per square', 'Aluminum: similar to standing seam, better for coastal areas'] },
    { heading: 'Ice dams: the Vermont-specific risk factor', body: 'Ice dams form when heat escapes through the roof, melts snow that refreezes at the cold eaves. They are the most common cause of water damage in Vermont homes. Roofing alone does not fix ice dams — the permanent solution is improved attic insulation and ventilation. A roof replacement is a good opportunity to address this, and many Vermont roofers will assess and recommend attic improvements as part of the project.' },
    { heading: 'Timing and availability', body: 'Vermont roofers are busiest in spring and fall. July through September is peak season. For a fall project, book by June. Emergency repairs can usually be addressed within a week; scheduled replacements need 3 to 6 weeks of lead time in peak season. Most roof replacements complete in 1 to 2 days of active work.' },
    { heading: 'What to expect on project day', body: 'A professional crew will arrive early, protect landscaping and openings, remove existing shingles, inspect and replace any damaged decking, install ice and water shield at eaves and valleys, then complete the new roof system. You should have a clean site by end of day. Reputable crews haul away all debris.' },
  ],
  faqs: [
    { q: 'How long does a roof last in Vermont?', a: 'Standard asphalt shingles last 20 to 25 years in Vermont conditions. Architectural shingles run 25 to 30 years. Metal roofing lasts 40 to 70 years. Ice dam damage can significantly shorten any roof lifespan.' },
    { q: 'Does homeowners insurance cover roof replacement in Vermont?', a: 'Insurance typically covers storm damage, falling trees, and similar sudden events. Normal wear and age-related deterioration is generally not covered. Ice dam damage coverage varies by policy — review yours before filing a claim.' },
    { q: 'Do I need a permit for roof replacement in Vermont?', a: 'Most Vermont municipalities require permits for full roof replacement. Your contractor handles this. Simple repairs typically do not require a permit.' },
  ],
  ctaHeading: 'Find a Vermont roofing contractor',
  ctaBody: 'Post your roofing project and we will match you with local contractors who serve your area. Free to submit, no obligation.',
  relatedGuides: [
    { label: 'How to find a contractor in Vermont', href: '/guides/how-to-find-contractor-vermont' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
  ],
  relatedPages: [
    { label: 'Roofing contractors Vermont', href: '/roofing-contractors-vermont' },
    { label: 'Roofing Burlington', href: '/roofing-burlington-vt' },
    { label: 'Roofing Stowe', href: '/roofing-stowe-vt' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }