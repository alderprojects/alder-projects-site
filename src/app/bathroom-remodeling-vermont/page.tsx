import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: 'Bathroom Remodeling Vermont | Alder Projects',
  description: 'Find vetted bathroom remodeling contractors across Vermont. Post your project free — matched with local contractors in 48 hours.',
}

const content = {
  "h1": "Bathroom Remodeling Contractors in Vermont",
  "heroImg": "https://plus.unsplash.com/premium_photo-1686090446868-92b77789ad08",
  "intro": "Find vetted bathroom remodeling contractors across Vermont. Post your project free — matched with local contractors in 48 hours.",
  "sections": [
    {"heading": "How It Works", "body": "Post your bathroom project free. We match you with 2–4 vetted Vermont contractors who specialize in bathroom work in your area. No cold calls, no spam — just qualified local contractors."},
    {"heading": "Bathroom Remodeling in Vermont", "body": "Vermont homes present unique challenges — older plumbing systems, tight spaces in farmhouses, and the need for moisture-resistant materials that handle Vermont winters. Common projects include full gut renovations, tub-to-shower conversions, tile work, vanity and fixture upgrades, and accessibility updates."}
  ],
  "townLinks": [
    {"label": "Burlington", "href": "/bathroom-remodeling-burlington-vt"},
    {"label": "Williston", "href": "/bathroom-remodeling-williston-vt"},
    {"label": "Morristown", "href": "/bathroom-remodeling-morristown-vt"}
  ],
  "faqs": [
    {"q": "How much does bathroom remodeling cost in Vermont?", "a": "A basic bathroom refresh typically runs $5,000–$10,000. A full gut renovation can run $15,000–$35,000 depending on scope and materials."},
    {"q": "How long does a bathroom remodel take?", "a": "Most bathroom remodels take 2–4 weeks. Projects requiring new plumbing rough-in or tile work may take 3–4 weeks. Scheduling with a Vermont contractor often requires 4–8 weeks of lead time."},
    {"q": "What’s the ROI on bathroom remodeling in Vermont?", "a": "Bathroom remodels consistently offer strong return on investment in Vermont’s housing market — typically 60–70% of project cost at resale. In high-demand areas like Burlington and Stowe, returns can be higher."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [
    {"label": "Bathroom remodeling in Burlington", "href": "/bathroom-remodeling-burlington-vt"},
    {"label": "Contractors in Chittenden County", "href": "/chittenden-county-vt"},
    {"label": "Kitchen remodeling in Vermont", "href": "/kitchen-remodeling-vermont"}
  ]
}

export default function Page() {
  return <SeoPage content={content} />
}
