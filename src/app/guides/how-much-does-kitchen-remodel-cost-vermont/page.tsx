import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'How Much Does a Kitchen Remodel Cost in Vermont? | Alder Projects',
  description: 'Vermont kitchen remodel costs by scope — minor refresh, mid-range renovation, full gut. Real ranges, not national averages.',
  alternates: { canonical: 'https://alderprojects.com/guides/how-much-does-kitchen-remodel-cost-vermont' },
}
const content = {
  eyebrow: 'Cost Guide', readTime: '6 min',
  h1: 'How Much Does a Kitchen Remodel Cost in Vermont?',
  intro: 'Vermont kitchen remodel costs vary more than national estimates suggest. Labor, material availability, and the age of Vermont homes all push costs in directions that Midwest or Southeast averages will not capture.',
  sections: [
    { heading: 'The honest answer: it depends on scope', body: 'Most Vermont homeowners planning a kitchen remodel are working with one of three budgets. The lines between them reflect what is actually possible at each price point given Vermont labor costs and the housing stock most people are working with.' },
    { heading: 'Minor refresh: $8,000 to $20,000', body: 'At this budget you are updating finishes without touching the layout — new cabinet doors, countertops, hardware, sink, faucet, lighting, and possibly appliances.', list: ['Cabinet refacing or repainting (keeping existing boxes)', 'Laminate or entry-level quartz countertops', 'New sink, faucet, and hardware', 'Lighting updates and tile backsplash', 'Appliance replacement (mid-range)'] },
    { heading: 'Mid-range renovation: $25,000 to $55,000', body: 'This is the most common range for Vermont kitchen projects. You can replace cabinets entirely with semi-custom boxes, install quartz or granite, add a modest island, upgrade flooring, and bring electrical up to code.', list: ['Full cabinet replacement with semi-custom boxes', 'Quartz or granite countertops', 'Hardwood or LVP flooring', 'Island addition if footprint allows', 'Minor layout changes and electrical'] },
    { heading: 'Full gut renovation: $60,000 to $120,000+', body: 'A full gut means everything goes. Custom cabinetry, high-end stone, professional appliances, new plumbing rough-in, full electrical, new windows, and structural changes. On older Vermont homes, this often includes bringing plumbing and wiring up to current code.' },
    { heading: 'What drives cost up in Vermont specifically', body: 'Labor costs in Chittenden County are comparable to mid-sized metro areas. Vermont homes from before 1970 frequently have surprises behind walls — knob-and-tube wiring, galvanized plumbing. Permits add a few weeks and a few hundred dollars for electrical, plumbing, or structural work.' },
    { heading: 'How to use these numbers', body: 'Use them to calibrate your expectations before any conversations. If your project sounds like a mid-range renovation but your budget is $18,000, that is important to know before you get quotes. A good contractor will tell you what is actually possible at your number.' },
  ],
  faqs: [
    { q: 'Does a kitchen remodel add value in Vermont?', a: 'Generally yes. A kitchen badly out of step with comparable homes is a liability; a well-done renovation brings you in line with local comps. Over-improving beyond the neighborhood rarely pays back dollar for dollar.' },
    { q: 'How long does a kitchen remodel take in Vermont?', a: 'Minor refreshes complete in 2 to 4 weeks. Mid-range renovations typically run 6 to 10 weeks once materials arrive. Full gut renovations are often 3 to 5 months from demolition to punch list.' },
    { q: 'Do I need a permit for a kitchen remodel in Vermont?', a: 'Permits are required for electrical, plumbing, and structural changes in all Vermont municipalities. Cabinet and countertop swaps typically do not require permits. Your contractor will handle the permit process.' },
    { q: 'What is the biggest budgeting mistake homeowners make?', a: 'Not building in a contingency. On older Vermont homes it is common to open walls and find something that needs addressing. A 15 to 20 percent contingency buffer is realistic, not pessimistic.' },
  ],
  ctaHeading: 'Ready to find a kitchen contractor in Vermont?',
  ctaBody: 'Post your project and we will match you with local contractors who specialize in kitchen work in your area. Free to submit, no obligation.',
  relatedGuides: [
    { label: 'How to find a contractor in Vermont', href: '/guides/how-to-find-contractor-vermont' },
    { label: 'What to ask before hiring', href: '/guides/what-to-ask-contractor-before-hiring' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
  ],
  relatedPages: [
    { label: 'Kitchen remodeling Burlington', href: '/kitchen-remodeling-burlington-vt' },
    { label: 'Kitchen remodeling Stowe', href: '/kitchen-remodeling-stowe-vt' },
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }