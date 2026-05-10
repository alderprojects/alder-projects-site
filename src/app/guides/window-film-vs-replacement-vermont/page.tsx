import type { Metadata } from 'next'
import TopicGuide from '@/components/TopicGuide'
import { WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT } from '@/content/topics/window-film-vs-replacement-vermont'

const PATH = '/guides/window-film-vs-replacement-vermont'

export const metadata: Metadata = {
  title: WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT.metaTitle,
  description: WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT.metaDescription,
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT.metaTitle,
    description: WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT.metaDescription,
    url: `https://alderprojects.com${PATH}`,
    type: 'article',
  },
}

export default function Page() {
  return <TopicGuide content={WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT} path={PATH} />
}
