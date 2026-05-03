import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT } from '@/content/topics/vermont-solar-battery-stack-2026'

const PATH = '/guides/vermont-solar-battery-stack-2026'

export const metadata: Metadata = {
  title: VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT.metaTitle,
  description: VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT.metaTitle,
    description: VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT} path={PATH} />
}
