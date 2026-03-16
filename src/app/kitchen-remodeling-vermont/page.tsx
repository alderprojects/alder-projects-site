import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Kitchen Remodeling Vermont | Alder Projects',
  description: 'Find vetted kitchen remodeling contractors across Vermont. Post your project free — get matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Kitchen Remodeling Contractors in Vermont",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723",
  "intro": "Find vetted kitchen remodeling contractors across Vermont. Post your project free — matched with local contractors in 48 hours. No spam, no cold calls.",
  "sections": [
    {"heading": "How Alder Projects Works", "body": "Post your kitchen remodeling project in minutes. We match you with 2–4 vetted Vermont contractors who specialize in kitchen work in your area. Compare bids and credentials, then hire the one that fits.<br/><br/><strong>Free to post</strong> — homeowners pay nothing to submit a project. <strong>Vetted contractors only</strong> — every contractor is reviewed before they can receive leads. <strong>You choose</strong> — no obligation to hire anyone."},
    {"heading": "Kitchen Remodeling Across Vermont", "body": "Vermont kitchens range from 1800s farmhouses in Addison County to modern condos in Burlington’s New North End. Common projects include cabinet replacement or refacing, countertop replacement (granite, quartz, butcher block), full kitchen layout changes, flooring and backsplash upgrades, and opening kitchens to adjacent living areas."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/kitchen-remodeling-burlington-vt"},
    {"label": "South Burlington", "href": "/kitchen-remodeling-south-burlington-vt"},
    {"label": "Stowe", "href": "/kitchen-remodeling-stowe-vt"},
    {"label": "Middlebury", "href": "/kitchen-remodeling-middlebury-vt"}
  ],
  "faqs": [
    {"q": "How much does kitchen remodeling cost in Vermont?", "a": "Kitchen remodeling costs in Vermont typically range from $15,000 for a cosmetic refresh to $80,000+ for a full gut renovation. Factors include cabinet quality, countertop material, appliance upgrades, and whether any walls are being moved."},
    {"q": "How long does a kitchen remodel take in Vermont?", "a": "A standard kitchen remodel takes 4–8 weeks once materials arrive. Full renovations with structural work can run 10–14 weeks. Custom cabinet lead times can add 3–6 weeks."},
    {"q": "Do I need a permit for kitchen remodeling in Vermont?", "a": "Permits are typically required when moving walls, relocating plumbing or electrical, or making structural changes. Cosmetic updates generally don’t require a permit. Your contractor will advise."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Kitchen remodeling in Burlington", "href": "/kitchen-remodeling-burlington-vt"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Bathroom remodeling in Vermont", "href": "/bathroom-remodeling-vermont"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
