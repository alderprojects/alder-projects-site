import type { Metadata } from 'next'
import SeasonalGuide from '@/components/SeasonalGuide'
import { PRE_WINTER_PREP_CONTENT } from '@/content/seasons/pre-winter-prep'

const PATH = '/vermont-pre-winter-prep'

export const metadata: Metadata = {
  title: PRE_WINTER_PREP_CONTENT.metaTitle,
  description: PRE_WINTER_PREP_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: PRE_WINTER_PREP_CONTENT.metaTitle,
    description: PRE_WINTER_PREP_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <SeasonalGuide content={PRE_WINTER_PREP_CONTENT} path={PATH} />
}
