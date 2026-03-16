import { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'
export const metadata: Metadata = {
  title: 'Basement Finishing Burlington VT | Alder Projects',
  description: 'Find vetted basement finishing contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.',
}
const content = {
  "h1": "Basement Finishing Contractors in Burlington, VT",
  "heroImg": "https://images.unsplash.com/photo-1646592491741-e79ae5953486",
  "intro": "Find vetted basement finishing contractors in Burlington, VT. Post your project free — matched with local contractors in 48 hours.",
  "sections": [{"heading": "Basement Finishing in Burlington", "body": "Burlington homes — particularly the Victorian and Craftsman houses on the Hill and New North End — often have large, unfinished basements with good ceiling heights. Converting this space to finished living area, a home office, or an accessory apartment is one of the highest-ROI projects in Burlington’s tight housing market. Burlington permitting requires egress windows for sleeping areas and specific electrical inspections."}],
  "faqs": [
    {"q": "How much does basement finishing cost in Burlington, VT?", "a": "Expect $20,000–$40,000 for a standard 600–800 sq ft basement finish in Burlington. Adding a bathroom adds $8,000–$15,000. Older Burlington homes may require additional moisture mitigation work."},
    {"q": "Do I need a permit to finish my basement in Burlington?", "a": "Yes — Burlington requires building permits for basement finishing. Electrical, plumbing, and egress work each require inspections. Your contractor will manage this process."},
    {"q": "Can I create a rental unit in my Burlington basement?", "a": "Burlington allows accessory dwelling units (ADUs) in basements subject to zoning approval. Requirements include minimum ceiling height, egress windows, and utility connections. Your contractor can advise on ADU compliance."}
  ],
  "ctaText": "Post Your Project Free →",
  "internalLinks": [{"label": "Basement finishing Vermont", "href": "/basement-finishing-vermont"}, {"label": "Contractors Chittenden County", "href": "/chittenden-county-vt"}]
}
export default function Page() { return <SeoPage content={content} /> }
