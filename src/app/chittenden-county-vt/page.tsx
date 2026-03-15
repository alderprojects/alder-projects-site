import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Contractors Chittenden County VT | Alder Projects',
  description: 'Find vetted renovation contractors in Chittenden County, VT — Burlington, South Burlington, Essex, Williston and more.',
}

const content = {
  "h1": "Home Renovation Contractors in Chittenden County, VT",
  "heroImg": "https://images.unsplash.com/photo-1757661543986-6f418adc8cb6",
  "intro": "Find vetted renovation contractors in Chittenden County, VT — Burlington, South Burlington, Essex, Williston, Shelburne and more.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your project free. We match you with 2–4 vetted Chittenden County contractors who specialize in your project type. No cold calls, no spam."},
    {"heading": "Chittenden County Renovation Market", "body": "Chittenden County has Vermont’s most active home renovation market. The county covers a wide range of housing — Victorian and Craftsman homes in Burlington, 1960s–1990s ranches in South Burlington and Williston, and newer construction in Essex and Shelburne. Renovation needs vary significantly by neighborhood and era."}
  ],
  "townLinks": [
    {"label": "Burlington kitchen remodeling", "href": "/kitchen-remodeling-burlington-vt"},
    {"label": "Burlington bathroom remodeling", "href": "/bathroom-remodeling-burlington-vt"},
    {"label": "Burlington deck builders", "href": "/deck-builders-burlington-vt"},
    {"label": "Burlington home additions", "href": "/home-additions-burlington-vt"},
    {"label": "South Burlington kitchen remodeling", "href": "/kitchen-remodeling-south-burlington-vt"}
  ],
  "faqs": [
    {"q": "How do I find a good contractor in Chittenden County?", "a": "Referrals are the traditional method, but Alder Projects vets contractors before they receive leads. Post your project and we’ll match you with reviewed contractors actively working in your area."},
    {"q": "Are contractors busy in Chittenden County?", "a": "Demand is consistently high. Most quality contractors book 4–8 weeks out. Post your project early to get ahead of the queue."},
    {"q": "What renovations add the most value in Chittenden County?", "a": "Kitchen and bathroom renovations consistently offer strong ROI in the Burlington area. Additions and finished basements are popular given tight housing inventory."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Bathroom remodeling Vermont", "href": "/bathroom-remodeling-vermont"},
    {"label": "Deck builders Vermont", "href": "/deck-builders-vermont"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
