import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Contractors Addison County VT | Alder Projects',
  description: 'Find vetted renovation contractors in Addison County VT — Middlebury, Vergennes, Bristol and surrounding towns.',
}

const content = {
  "h1": "Home Renovation Contractors in Addison County, VT",
  "heroImg": "https://images.unsplash.com/photo-1757661543986-6f418adc8cb6",
  "intro": "Find vetted renovation contractors in Addison County, VT — Middlebury, Vergennes, Bristol and surrounding towns.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your project free. We match you with vetted Addison County contractors who specialize in your project type. No cold calls, no spam."},
    {"heading": "Renovation in Addison County", "body": "Addison County sits in the Champlain Valley between the Green Mountains and Lake Champlain. Its towns — Middlebury, Vergennes, Bristol — have a mix of old farmhouses, college-town housing, and rural properties. The housing stock skews older, with many homes built in the 19th and early 20th centuries."}
  ],
  "townLinks": [
    {"label": "Middlebury kitchen remodeling", "href": "/kitchen-remodeling-middlebury-vt"},
    {"label": "Middlebury deck builders", "href": "/deck-builders-middlebury-vt"},
    {"label": "Vergennes home additions", "href": "/home-additions-vergennes-vt"}
  ],
  "faqs": [
    {"q": "How do I find a contractor in Addison County?", "a": "Word of mouth is common in smaller Vermont communities. Alder Projects gives you a systematic option — post your project and we match you with vetted contractors working in your area."},
    {"q": "Are there enough contractors working in Addison County?", "a": "The contractor market is tighter than in Chittenden County. Booking lead times can be longer. Planning ahead and posting early gives you the best options."},
    {"q": "What types of projects are most common in Addison County?", "a": "Kitchen and bathroom updates are most common in the Middlebury area. Farm properties and older homes often need structural additions and weatherization work."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Deck builders Vermont", "href": "/deck-builders-vermont"},
    {"label": "Chittenden County contractors", "href": "/chittenden-county-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
