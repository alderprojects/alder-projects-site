'use client'

// v7.2.14 — fire-and-forget page-view tracker.
//
// Drops into a server-rendered page to fire one analytics event on
// mount. Used by /smart-cart/topic/[slug] and /guides/[slug] pages
// to fill the topic_view and guide_view gaps in the existing event
// coverage.

import { useEffect } from 'react'
import { trackTopicView, trackGuideView } from '@/lib/analytics'

type Props =
  | { kind: 'topic'; slug: string; topicId?: string; scopeVariantId?: string }
  | { kind: 'guide'; slug: string; topicId?: string }

export default function PageViewEvent(props: Props) {
  useEffect(() => {
    if (props.kind === 'topic') {
      trackTopicView({
        slug: props.slug,
        topicId: props.topicId,
        scopeVariantId: props.scopeVariantId,
      })
    } else if (props.kind === 'guide') {
      trackGuideView({
        slug: props.slug,
        topicId: props.topicId,
      })
    }
    // Intentionally fire once on mount; props are stable per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
