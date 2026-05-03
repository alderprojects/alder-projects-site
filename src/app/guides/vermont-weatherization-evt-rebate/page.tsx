import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT } from '@/content/topics/vermont-weatherization-evt-rebate'

const PATH = '/guides/vermont-weatherization-evt-rebate'

export const metadata: Metadata = {
  title: VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT.metaTitle,
  description: VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT.metaTitle,
    description: VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT} path={PATH} />
}
