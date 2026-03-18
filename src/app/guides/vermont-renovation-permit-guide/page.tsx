import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'Do I Need a Permit for My Vermont Renovation? | Alder Projects',
  description: "Which Vermont renovation projects require permits, what the process looks like, and why skipping permits is a bigger risk than most homeowners realize.",
  alternates: { canonical: 'https://alderprojects.com/guides/vermont-renovation-permit-guide' },
}
const content = {
  eyebrow: 'Permits and Process', readTime: '5 min',
  h1: 'Do I Need a Permit for My Vermont Renovation?',
  intro: "Vermont permit requirements are set at the municipal level, which means what is required in Burlington differs from a small town. But the general rules are consistent enough to give you a solid starting point.",
  sections: [
    { heading: 'The general rule for Vermont renovations', body: 'Permits are typically required for structural changes, new or modified electrical, plumbing, HVAC, or changes to the building footprint. Cosmetic work — painting, flooring, cabinet hardware — generally does not require a permit. When in doubt, call your municipal zoning office. A five-minute phone call is worth it.' },
    { heading: 'Projects that almost always require a permit', body: 'Your contractor should know local requirements and handle permit applications as part of the project. If a contractor says a permit is not needed for work that sounds like it should require one, get a second opinion.', list: ['Electrical: new circuits, panel upgrades, adding outlets', 'Plumbing: moving or adding fixtures, water heater replacement', 'Structural: removing walls, adding beams, changing window openings', 'New decks and porches', 'Room additions and home additions', 'Basement finishing with electrical and egress', 'HVAC system replacement or new installation', 'Roofing in most Vermont municipalities'] },
    { heading: 'Projects that usually do not require a permit', list: ['Painting interior or exterior', 'Flooring replacement', 'Cabinet and countertop replacement in same location', 'Fixture replacement with no plumbing changes', 'Landscaping in most cases'], body: 'These are general guidelines. Your municipality may have specific requirements that differ from this list.' },
    { heading: 'Why skipping permits is riskier than it sounds', body: "Unpermitted work creates problems when you sell. Buyers' home inspectors flag it, lenders sometimes refuse to finance the purchase, and you may be required to bring work up to code at your expense before closing. Unpermitted electrical or structural work also voids homeowner's insurance coverage for related claims." },
    { heading: 'What the permit process actually looks like', body: 'Your contractor submits applications to the municipal building department. Review takes 2 to 4 weeks for standard residential work. An inspector visits during construction and at completion. The whole process adds a few hundred dollars and a few weeks — a modest cost for the protection it provides.' },
  ],
  faqs: [
    { q: 'Who pulls the permit — me or my contractor?', a: "Either the homeowner or the licensed contractor can pull permits in Vermont. In practice, your contractor should handle this. Make sure it is explicit in your contract that permits are their responsibility." },
    { q: 'What happens if I do unpermitted work and then sell my house?', a: "Unpermitted work typically surfaces during the buyer's inspection. You may be required to obtain retroactive permits, bring work up to current code at your expense, or negotiate a price reduction." },
    { q: 'How much do permits cost in Vermont?', a: "Building permit fees vary by municipality and project size. For most residential renovations, expect $150 to $800 in permit fees. Larger projects are often calculated as a percentage of project value." },
  ],
  ctaHeading: 'Find a Vermont contractor who handles the permit process',
  ctaBody: 'Post your project and we will match you with local contractors who manage permits as part of the job. No calls, no spam.',
  relatedGuides: [
    { label: 'How to find a contractor in Vermont', href: '/guides/how-to-find-contractor-vermont' },
    { label: 'What to ask before hiring', href: '/guides/what-to-ask-contractor-before-hiring' },
  ],
  relatedPages: [
    { label: 'Roofing contractors Vermont', href: '/roofing-contractors-vermont' },
    { label: 'Home additions Vermont', href: '/home-additions-vermont' },
    { label: 'Deck builders Vermont', href: '/deck-builders-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }