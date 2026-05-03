import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { HEAT_PUMP_REBATE_STACK_2026_CONTENT } from '@/content/topics/vermont-heat-pump-rebate-stack-2026'

const PATH = '/guides/vermont-heat-pump-rebate-stack-2026'

export const metadata: Metadata = {
  title: HEAT_PUMP_REBATE_STACK_2026_CONTENT.metaTitle,
  description: HEAT_PUMP_REBATE_STACK_2026_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: HEAT_PUMP_REBATE_STACK_2026_CONTENT.metaTitle,
    description: HEAT_PUMP_REBATE_STACK_2026_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={HEAT_PUMP_REBATE_STACK_2026_CONTENT} path={PATH} />
}
