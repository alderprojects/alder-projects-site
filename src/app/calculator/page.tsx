import type { Metadata } from 'next'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Vermont Renovation Cost Calculator | Real Ranges, Not National Averages',
  description: 'Estimate your Vermont renovation cost in seconds. 8 project types, location adjustments, contingency slider. Real Vermont ranges from 2026 quotes.',
  alternates: { canonical: 'https://alderprojects.com/calculator' },
  openGraph: {
    title: 'Vermont Renovation Cost Calculator',
    description: 'Estimate your Vermont renovation cost in seconds. Real Vermont ranges, not national averages.',
    type: 'website',
    url: 'https://alderprojects.com/calculator',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Why are Vermont renovation costs higher than national averages?', acceptedAnswer: { '@type': 'Answer', text: 'Three structural reasons: lower contractor density per capita (especially outside Chittenden County), shorter exterior work season (May-October), and higher travel time for rural job sites. The labor differential is real and structural, not a markup.' } },
    { '@type': 'Question', name: 'What is a typical Vermont contractor deposit?', acceptedAnswer: { '@type': 'Answer', text: 'Standard 20-33% on signing. Anything over 33% upfront is a yellow flag in Vermont. Vermont law (9 V.S.A. § 4205) requires registered contractors for jobs over $10,000.' } },
    { '@type': 'Question', name: 'How long do Vermont renovations take to start?', acceptedAnswer: { '@type': 'Answer', text: 'Add 4-12 weeks of lead time before start for contractor availability. Kitchens take 6-14 weeks once started; bathrooms 3-6 weeks; basement finishing 6-10 weeks; decks 1-3 weeks; roof replacement 1-4 days; heat pump install 2-5 days.' } },
    { '@type': 'Question', name: 'How do I verify a Vermont contractor?', acceptedAnswer: { '@type': 'Answer', text: 'Vermont Secretary of State professional registry at secure.professionals.vermont.gov verifies active registration (required for jobs over $10K) and shows any disciplinary actions. Vermont Builders & Remodelers Association directory at homebuildersvt.com lists code-of-ethics members.' } },
    { '@type': 'Question', name: 'Is it cheaper to renovate in winter?', acceptedAnswer: { '@type': 'Answer', text: 'For interior work, sometimes. Some contractors discount 5-15% for January-March schedules to fill slow months. Exterior work is rarely cheaper in winter because most exterior contractors do not work then.' } },
    { '@type': 'Question', name: 'How accurate is this estimator?', acceptedAnswer: { '@type': 'Answer', text: 'Ranges are based on Vermont quotes from 2025-2026, adjusted by location. Real quotes typically fall within the displayed range 80%+ of the time.' } },
    { '@type': 'Question', name: 'Should I add a contingency to my budget?', acceptedAnswer: { '@type': 'Answer', text: '15-20% is standard for cosmetic and mid-range projects. 20-25% for older homes or full renovations. Vermont homes often surprise contractors during demo with hidden issues — knob-and-tube wiring, asbestos, settled framing — that drive cost overruns.' } },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://alderprojects.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://alderprojects.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Cost Calculator', item: 'https://alderprojects.com/calculator' },
  ],
}

export default function CalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Calculator />
    </>
  )
}
