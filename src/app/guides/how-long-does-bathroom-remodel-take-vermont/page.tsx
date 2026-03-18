import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'How Long Does a Bathroom Remodel Take in Vermont? | Alder Projects',
  description: "Realistic Vermont bathroom remodel timelines by scope — from minor updates to full gut renovations. What causes delays and how to avoid them.",
  alternates: { canonical: 'https://alderprojects.com/guides/how-long-does-bathroom-remodel-take-vermont' },
}
const content = {
  eyebrow: 'Timeline Guide', readTime: '5 min',
  h1: 'How Long Does a Bathroom Remodel Take in Vermont?',
  intro: "The honest answer: longer than you would expect from a national estimate. Here is what the timeline actually looks like by scope, and what causes most of the delays.",
  sections: [
    { heading: 'Before construction even starts', body: 'In Vermont, quality bathroom contractors are typically booked 3 to 6 weeks out. Custom or special-order tile can take 4 to 8 weeks to arrive. Permits for plumbing and electrical changes add 2 to 4 weeks. Plan on 6 to 10 weeks of lead time between hiring a contractor and the first day of demolition.' },
    { heading: 'Minor bathroom refresh: 1 to 2 weeks', body: 'A refresh that keeps the same layout — new vanity, toilet, fixtures, mirror, lighting — can complete in 1 to 2 weeks of active construction. This scope avoids longer tile lead times and typically does not require permits if plumbing locations stay the same.', list: ['Demo and prep: 1 to 2 days', 'Minor plumbing work: 1 day', 'New vanity and toilet installation: 1 day', 'Lighting and accessories: 1 day', 'Painting and punch list: 1 to 2 days'] },
    { heading: 'Mid-range renovation: 2 to 4 weeks', body: 'A renovation that replaces tile, relocates fixtures modestly, and installs a new shower or tub surround typically runs 2 to 4 weeks of active construction. A complex shower tile job with niches and heating takes significantly longer than basic subway tile.' },
    { heading: 'Full gut renovation: 4 to 8 weeks', body: 'A full gut — down to studs, new plumbing rough-in, new electrical, radiant floor heat, custom tile — is 4 to 8 weeks of active construction. On older Vermont homes, add time for what is behind the walls: knob-and-tube wiring, galvanized pipes, and subfloor damage are common discoveries.' },
    { heading: 'What causes most Vermont bathroom remodel delays', body: 'In order of frequency: materials arriving late, permit inspections that fail the first time, surprises in older homes, and contractor scheduling conflicts.', list: ['Late material delivery, especially custom or imported tile', 'Failed permit inspection requiring rework', 'Unexpected conditions behind walls — water damage, old wiring', 'Contractor schedule conflicts with other jobs', 'Change orders that require new materials'] },
    { heading: 'How to build a realistic timeline', body: 'Work backwards from when you need the bathroom done. Add construction time for your scope, then 6 to 10 weeks of lead time, then a 2-week buffer. If you need it done by Thanksgiving, start talking to contractors in August.' },
  ],
  faqs: [
    { q: 'Can my family use the bathroom during a remodel?', a: "For a full gut renovation, no — the bathroom will be non-functional for most of the project. For partial renovations, your contractor can sometimes phase work to keep the toilet functional. Discuss this before construction starts." },
    { q: 'Is there a better time of year to remodel a bathroom in Vermont?', a: "Interior work like bathroom remodels can happen any time. Contractor availability is typically better in late fall and winter when exterior and deck work slows down." },
    { q: 'What is the most common cause of a bathroom project going over schedule?', a: "Materials arriving later than expected, especially custom tile. Order everything before demolition starts and confirm ship dates with your supplier." },
    { q: 'How much does a bathroom remodel cost in Vermont?', a: "Minor refreshes run $5,000 to $12,000. Mid-range renovations run $12,000 to $28,000. Full gut renovations range from $25,000 to $55,000 or more depending on scope and finishes." },
  ],
  ctaHeading: 'Find a Vermont bathroom contractor',
  ctaBody: 'Describe your bathroom project and we will match you with local contractors who serve your area. Free to post, no obligation, no phone calls.',
  relatedGuides: [
    { label: 'How to find a contractor in Vermont', href: '/guides/how-to-find-contractor-vermont' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
    { label: 'What to ask before hiring', href: '/guides/what-to-ask-contractor-before-hiring' },
  ],
  relatedPages: [
    { label: 'Bathroom remodeling Burlington', href: '/bathroom-remodeling-burlington-vt' },
    { label: 'Bathroom remodeling Vermont', href: '/bathroom-remodeling-vermont' },
    { label: 'Bathroom remodeling Stowe', href: '/bathroom-remodeling-stowe-vt' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }