import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { VERMONT_REBATE_STACK_2026_CONTENT } from '@/content/topics/vermont-rebate-stack-2026'

const PATH = '/guides/vermont-rebate-stack-2026'

export const metadata: Metadata = {
  title: VERMONT_REBATE_STACK_2026_CONTENT.metaTitle,
  description: VERMONT_REBATE_STACK_2026_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: VERMONT_REBATE_STACK_2026_CONTENT.metaTitle,
    description: VERMONT_REBATE_STACK_2026_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={VERMONT_REBATE_STACK_2026_CONTENT} path={PATH} />
}
