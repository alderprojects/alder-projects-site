import type { Metadata } from 'next'
import SeasonalGuide from '@/components/SeasonalGuide'
import { FALL_LEAF_WEATHERIZATION_CONTENT } from '@/content/seasons/fall-leaf-weatherization'

const PATH = '/vermont-fall-leaf-weatherization'

export const metadata: Metadata = {
  title: FALL_LEAF_WEATHERIZATION_CONTENT.metaTitle,
  description: FALL_LEAF_WEATHERIZATION_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: FALL_LEAF_WEATHERIZATION_CONTENT.metaTitle,
    description: FALL_LEAF_WEATHERIZATION_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <SeasonalGuide content={FALL_LEAF_WEATHERIZATION_CONTENT} path={PATH} />
}
