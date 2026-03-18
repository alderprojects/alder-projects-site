import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'How to Find a Good Contractor in Vermont | Alder Projects',
  description: "How Vermont homeowners find reliable contractors — what works, what doesn't, and what to verify before signing anything.",
  alternates: { canonical: 'https://alderprojects.com/guides/how-to-find-contractor-vermont' },
}
const content = {
  eyebrow: 'Hiring Guide', readTime: '5 min',
  h1: 'How to Find a Good Contractor in Vermont',
  intro: "Vermont's contractor market is tight. Good contractors here stay busy through word of mouth — they rarely advertise because they do not need to. That makes finding one harder for homeowners who do not already have a network.",
  sections: [
    { heading: 'Start with referrals, then go one step further', body: 'The most reliable source in Vermont is still word of mouth. Ask neighbors, your realtor, the lumber yard. But ask specifically: did the project come in on budget? Did the contractor communicate during the project? Would they hire them again for the same type of work?' },
    { heading: 'Verify license and insurance before anything else', body: "Vermont requires contractor registration for most residential work — verify at labor.vermont.gov. Ask for a certificate of liability insurance and workers compensation. A contractor who makes this difficult is one to avoid.", list: ['Vermont contractor registration at labor.vermont.gov', 'General liability insurance — $1M per occurrence minimum', "Workers compensation if they have employees", 'Certificate of insurance naming your project address'] },
    { heading: 'Get three quotes, but price is not the ranking criterion', body: "Three quotes give you enough information to understand what the market is saying about your scope. If two quotes are in the same range and one is 40 percent lower, that outlier is not a bargain — it signals something is missing from their scope." },
    { heading: "Understand Vermont's contractor shortage reality", body: "In much of Vermont, quality contractors are booked 4 to 8 weeks out for most trades. If someone can start your job next week, ask why. Planning ahead is especially important for spring and summer projects, which need to be scheduled by late winter." },
    { heading: 'Read the contract before signing', body: "A proper contract includes: detailed scope of work, materials specified by brand and model, payment schedule tied to milestones, start and completion dates, a change order process. If a contractor will not put something in writing, do not hire them." },
    { heading: 'The payment schedule matters', body: "A reasonable schedule: 10 to 15 percent deposit at signing, progress payments tied to milestones, and a meaningful holdback of 5 to 10 percent until punch list items are resolved. Never pay more than 50 percent upfront." },
  ],
  faqs: [
    { q: 'Is it normal for Vermont contractors to be booked months out?', a: 'Yes. Quality contractors in Chittenden County stay booked 4 to 8 weeks out. Plan ahead, especially for spring and summer projects.' },
    { q: 'Should I use a general contractor or hire trades directly?', a: 'For projects involving multiple trades, a GC managing subcontractors is almost always worth the markup. For single-trade work, hiring that trade directly makes sense.' },
    { q: "What is a red flag in a Vermont contractor quote?", a: "Vague scope, large upfront payment requirements over 30 percent, no written contract offered, or a quote significantly below the others without a clear explanation." },
  ],
  ctaHeading: 'Find a matched Vermont contractor for your project',
  ctaBody: 'Post your project and we will match you with local contractors who specialize in your trade and serve your area. Free to submit, no obligation, no phone calls.',
  relatedGuides: [
    { label: 'What to ask a contractor before hiring', href: '/guides/what-to-ask-contractor-before-hiring' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
    { label: 'Kitchen remodel costs in Vermont', href: '/guides/how-much-does-kitchen-remodel-cost-vermont' },
  ],
  relatedPages: [
    { label: 'Contractors in Chittenden County', href: '/chittenden-county-vt' },
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
    { label: 'Bathroom remodeling Vermont', href: '/bathroom-remodeling-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }