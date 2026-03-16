import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Kitchen Remodeling South Burlington VT | Alder Projects',
  description: 'Find vetted kitchen remodeling contractors in South Burlington, VT. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Kitchen Remodeling Contractors in South Burlington, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find vetted kitchen remodeling contractors in South Burlington, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "Kitchen Remodeling in South Burlington", "body": "South Burlington is Vermont’s second largest city — a mix of 1960s–1990s suburban homes and newer construction near Williston Road. Kitchens from this era are ripe for renovation. Most common requests: full cabinet replacement (painted shaker cabinets are the current standard), quartz or granite countertop replacement, opening kitchens to dining areas, appliance upgrades, and new flooring."}
  ],
  "faqs": [
    {"q": "How much does kitchen remodeling cost in South Burlington?", "a": "Expect $18,000–$55,000 for a standard South Burlington kitchen remodel. The range depends on cabinet choice and whether walls are being moved."},
    {"q": "How long does a kitchen remodel take in South Burlington?", "a": "5–8 weeks for most projects once materials arrive. Custom cabinets add 4–6 weeks."},
    {"q": "Do I need a permit in South Burlington?", "a": "South Burlington requires permits for electrical, plumbing, and structural work. Your contractor will pull the necessary permits."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling in Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Kitchen remodeling in Burlington", "href": "/kitchen-remodeling-burlington-vt"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
