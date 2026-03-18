import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'
export const metadata: Metadata = {
  title: 'What to Ask a Contractor Before Hiring | Alder Projects',
  description: "The questions that actually matter when interviewing Vermont contractors — what separates good contractors from problems.",
  alternates: { canonical: 'https://alderprojects.com/guides/what-to-ask-contractor-before-hiring' },
}
const content = {
  eyebrow: 'Hiring Checklist', readTime: '6 min',
  h1: 'What to Ask a Contractor Before Hiring',
  intro: "Most hiring guides tell you to ask if the contractor is licensed and insured. That is table stakes. These are the questions that actually help you tell a good contractor from a problem before you sign anything.",
  sections: [
    { heading: 'About their experience with your specific project type', body: "Generic years of experience does not tell you much. Ask for examples of projects similar to yours.", list: ['"Can you show me 2 to 3 projects similar to mine completed in the last two years?"', '"How many kitchen remodels have you done?"', '"Have you worked on homes like mine — same age, same construction type?"', '"What was the most challenging part of a project like this?"'] },
    { heading: 'About their schedule and your project', body: 'Vermont contractors book out — but vague timelines create problems later. Pin down specifics before you commit.', list: ['"When can you start, and what could push that date?"', '"How many other projects will you be running simultaneously?"', '"Who will be on site day-to-day — you or subcontractors?"', '"What is your realistic completion date, and what happens if you go over?"'] },
    { heading: 'About money and the contract', body: 'Payment schedule disputes are one of the most common sources of contractor problems.', list: ['"What is your payment schedule, and what does each payment cover?"', '"How do you handle change orders — process and pricing?"', '"What is the deposit, and what does it cover?"', '"What is the final payment tied to — completion of punch list items?"'] },
    { heading: 'About what could go wrong', body: 'This is the question most homeowners skip. Asking it signals you are a serious client.', list: ['"What is the most common unexpected issue in projects like mine?"', '"If you open a wall and find something that changes the scope, how do we handle that?"', '"Have you ever had to walk away from a project? What happened?"'] },
    { heading: 'The one question that filters out most bad contractors', body: '"Can I see the contract before we agree to anything?" A contractor who hesitates or offers a one-page summary is not ready for a serious project. A proper contract specifies scope, materials, timeline, payment schedule, and change order process.' },
  ],
  faqs: [
    { q: 'How many contractors should I interview?', a: 'Three is the standard recommendation and it holds up. Enough to get a sense of market rate and hear different approaches without spending weeks on selection.' },
    { q: 'Is a lower quote a red flag?', a: 'Not automatically, but it warrants explanation. Ask what is included that the other quotes did not cover, and what is excluded.' },
    { q: 'What if I like the contractor but their quote is over my budget?', a: 'Tell them. A good contractor will tell you what is achievable at your number, or what you would need to cut to get there.' },
  ],
  ctaHeading: 'Find Vermont contractors worth interviewing',
  ctaBody: 'Post your project and we will match you with local contractors who are right for your scope and area.',
  relatedGuides: [
    { label: 'How to find a contractor in Vermont', href: '/guides/how-to-find-contractor-vermont' },
    { label: 'Vermont renovation permit guide', href: '/guides/vermont-renovation-permit-guide' },
    { label: 'Kitchen remodel costs in Vermont', href: '/guides/how-much-does-kitchen-remodel-cost-vermont' },
  ],
  relatedPages: [
    { label: 'Kitchen remodeling Vermont', href: '/kitchen-remodeling-vermont' },
    { label: 'Bathroom remodeling Vermont', href: '/bathroom-remodeling-vermont' },
    { label: 'Home additions Vermont', href: '/home-additions-vermont' },
  ],
}
export default function Page() { return <GuidePage content={content} /> }