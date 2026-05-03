import type { Metadata } from 'next'
import SeasonalGuide from '@/components/SeasonalGuide'
import { DEEP_WINTER_CONTENT } from '@/content/seasons/deep-winter'

const PATH = '/vermont-deep-winter'

export const metadata: Metadata = {
  title: DEEP_WINTER_CONTENT.metaTitle,
  description: DEEP_WINTER_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: DEEP_WINTER_CONTENT.metaTitle,
    description: DEEP_WINTER_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <SeasonalGuide content={DEEP_WINTER_CONTENT} path={PATH} />
}
