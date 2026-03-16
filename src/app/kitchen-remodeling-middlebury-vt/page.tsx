import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Kitchen Remodeling Middlebury VT | Alder Projects',
  description: 'Find vetted kitchen remodeling Middlebury VT contractors. Kitchen remodeling in Middlebury often means working with historic Victorian homes and tight galley kitchens. Post your project free — matched in 48 hours.',
}

const content = {
  "h1": "Kitchen Remodeling Contractors in Middlebury, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find vetted kitchen remodeling contractors in Middlebury, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "Kitchen Remodeling in Middlebury", "body": "Middlebury is Addison County’s shire town — a college town with a historic downtown, Victorian homes, and working-class neighborhoods stretching toward the Champlain Valley farmland. Kitchens are often small, dated, and not laid out for how people cook today. Common goals: opening kitchens to adjacent space, updating cabinets and countertops while preserving period details, adding storage in tight layouts, replacing aging plumbing and electrical, and new flooring."}
  ],
  "faqs": [
    {"q": "How much does kitchen remodeling cost in Middlebury, VT?", "a": "Expect $15,000–$45,000 for a standard Middlebury kitchen remodel. The Addison County contractor market is tighter than Burlington, so getting multiple bids is valuable — Alder Projects helps with this."},
    {"q": "Are there good kitchen contractors in Middlebury?", "a": "Yes — Middlebury and Addison County have experienced renovation contractors. The key is finding those who are available and taking on new projects, which is what Alder Projects helps you do."},
    {"q": "How long does a kitchen remodel take in Middlebury?", "a": "5–8 weeks is typical once work begins. Lead times for scheduling can be longer in Addison County than in Chittenden County — book early."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling in Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Contractors in Addison County", "href": "/addison-county-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
