import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Vermont Contractor Red Flags: What to Watch For | Alder Projects',
  description: 'The warning signs that experienced Vermont homeowners watch for before hiring a contractor — from the first call through contract signing.',
  alternates: { canonical: 'https://alderprojects.com/guides/vermont-contractor-red-flags' },
}
const content = {
  eyebrow: 'Hiring Guide', readTime: '5 min',
  h1: 'Vermont Contractor Red Flags: What to Watch For',
  intro: 'Most contractor problems are visible before any work begins. These are the signals that experienced Vermont homeowners have learned to take seriously.',
  sections: [
    { heading: 'Before the first meeting', list: [
      'No website, no reviews, no verifiable business presence',
      'Cannot provide a Vermont contractor registration number',
      'Refuses to provide proof of insurance before quoting',
      'Found through an unsolicited door knock or flyer after a storm',
      'Significantly lower price than competitors with no explanation',
    ], body: 'These are not disqualifying on their own, but each one warrants a direct question. A legitimate contractor has straightforward answers.' },
    { heading: 'During the estimate', list: [
      'Vague scope — "all work included" without line-item detail',
      'Pressure to sign before getting other quotes',
      'Large upfront deposit demanded before any work begins (over 30 percent)',
      'No written contract offered, or contract is one page',
      'Cannot name their subcontractors for specialty trades',
    ], body: 'The estimate conversation tells you how the project will go. A contractor who is evasive about scope or money at this stage will be evasive about change orders later.' },
    { heading: 'Permits and licensing', list: [
      'Suggests you can skip the permit to save money',
      'Cannot explain what permits are required for your project',
      'Asks you to pull the permit yourself to avoid their license being associated',
    ], body: 'In Vermont, suggesting unpermitted work is a significant red flag. Your contractor should manage permits as a routine part of the job, not treat them as optional.' },
    { heading: 'References', list: [
      'Cannot provide references from similar projects',
      'References are from years ago or from family and friends only',
      'Reluctant to let you speak directly with past clients',
    ], body: 'A contractor with genuine past work is proud of it and comfortable with references. Reluctance here almost always reflects a reason for reluctance.' },
    { heading: 'The one that matters most', body: '"We need a large deposit to order materials and we can start tomorrow." This is the most common setup for contractor fraud in Vermont — the contractor takes a large upfront payment, orders little or nothing, and either disappears or does minimal work before demanding more money. A reasonable deposit is 10 to 15 percent. Anything above 30 percent before work begins is a serious warning sign.' },
  ],
  faqs: [
    { q: 'How do I verify a Vermont contractor is licensed?', a: 'Check contractor registration at labor.vermont.gov. Vermont requires registration for most residential construction work. Electrical and plumbing contractors have separate licensing through the Department of Public Safety.' },
    { q: 'What recourse do I have if a Vermont contractor does bad work?', a: 'Document everything in writing. Contact the Vermont Attorney General consumer protection division. Report unlicensed contractors to the Vermont Department of Labor. For licensed contractors, file a complaint with the licensing board. Small claims court handles disputes up to $5,000.' },
    { q: 'Is a verbal agreement binding in Vermont?', a: 'Verbal contracts can be legally binding in Vermont, but they are nearly impossible to enforce in practice. Always get the full scope, price, and timeline in writing before work begins.' },
  ],
  ctaHeading: 'Find vetted Vermont contractors for your project',
  ctaBody: 'Post your project and we will match you with local contractors who have been reviewed before appearing on the platform. Free, no obligation.',
  relatedGuides: [
    { label: 'What to ask before hiring', href: '/guides/what-to-ask-contractor-before-hiring' },
    { label: 'How to find a contractor in Vermont', href: '/guides/how-to-find-contractor-vermont' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
  ],
  relatedPages: [
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
    { label: 'Roofing contractors Vermont', href: '/roofing-contractors-vermont' },
    { label: 'Home additions Vermont', href: '/home-additions-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }