import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT } from '@/content/topics/before-finishing-basement-moisture-checks-vermont'

const PATH = '/guides/before-finishing-basement-moisture-checks-vermont'

export const metadata: Metadata = {
  title: BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT.metaTitle,
  description: BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT.metaTitle,
    description: BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT} path={PATH} />
}
