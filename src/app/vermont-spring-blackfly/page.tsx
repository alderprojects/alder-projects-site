import type { Metadata } from 'next'
import SeasonalGuide from '@/components/SeasonalGuide'
import { SPRING_BLACKFLY_CONTENT } from '@/content/seasons/spring-blackfly'

const PATH = '/vermont-spring-blackfly'

export const metadata: Metadata = {
  title: SPRING_BLACKFLY_CONTENT.metaTitle,
  description: SPRING_BLACKFLY_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: SPRING_BLACKFLY_CONTENT.metaTitle,
    description: SPRING_BLACKFLY_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <SeasonalGuide content={SPRING_BLACKFLY_CONTENT} path={PATH} />
}
