import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Kitchen Remodeling Burlington VT | Alder Projects',
  description: 'Find vetted kitchen remodeling contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Kitchen Remodeling Contractors in Burlington, VT",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find vetted kitchen remodeling contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "Kitchen Remodeling in Burlington", "body": "Burlington is Vermont’s largest city with a diverse housing stock — Victorian and Craftsman homes on the Hill and New North End, triple-deckers on the South End, and newer construction near UVM. Common projects include opening kitchen walls to adjacent dining areas, cabinet replacement, countertop upgrades (quartz and granite), new flooring, and appliance packages."},
    {"heading": "What to Expect", "body": "Burlington has an active renovation contractor market. Quality contractors book 4–8 weeks out. Permitting through Burlington’s Department of Planning and Zoning is required for structural changes — your contractor will manage this."}
  ],
  "faqs": [
    {"q": "How much does kitchen remodeling cost in Burlington, VT?", "a": "Expect $20,000–$60,000 for a standard kitchen remodel in Burlington. Full gut renovations with custom cabinets and structural changes can reach $80,000+."},
    {"q": "Do I need a permit for a kitchen remodel in Burlington?", "a": "Burlington requires permits for work involving electrical, plumbing, or structural changes. Cabinet and countertop swaps typically don’t require permits."},
    {"q": "How long does a kitchen remodel take in Burlington?", "a": "Plan for 6–10 weeks once work begins. Custom cabinet lead times can add 4–6 weeks to the schedule."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling in Vermont", "href": "/kitchen-remodeling-vermont"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Bathroom remodeling in Burlington", "href": "/bathroom-remodeling-burlington-vt"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
