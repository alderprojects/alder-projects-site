import type { Metadata } from 'next'
import SeasonalGuide from '@/components/SeasonalGuide'
import { LAKE_SEASON_CONTENT } from '@/content/seasons/lake-season'

const PATH = '/vermont-lake-season'

export const metadata: Metadata = {
  title: LAKE_SEASON_CONTENT.metaTitle,
  description: LAKE_SEASON_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: LAKE_SEASON_CONTENT.metaTitle,
    description: LAKE_SEASON_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <SeasonalGuide content={LAKE_SEASON_CONTENT} path={PATH} />
}
