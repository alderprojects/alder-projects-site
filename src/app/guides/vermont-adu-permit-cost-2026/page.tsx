import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { VERMONT_ADU_PERMIT_COST_2026_CONTENT } from '@/content/topics/vermont-adu-permit-cost-2026'

const PATH = '/guides/vermont-adu-permit-cost-2026'

export const metadata: Metadata = {
  title: VERMONT_ADU_PERMIT_COST_2026_CONTENT.metaTitle,
  description: VERMONT_ADU_PERMIT_COST_2026_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: VERMONT_ADU_PERMIT_COST_2026_CONTENT.metaTitle,
    description: VERMONT_ADU_PERMIT_COST_2026_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={VERMONT_ADU_PERMIT_COST_2026_CONTENT} path={PATH} />
}
