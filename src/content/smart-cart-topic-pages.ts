// v7.2.14 — Smart Cart pre-cart topic landing pages.
//
// Each entry powers /smart-cart/topic/[slug] — a focused SEO landing
// that converts paid + organic visitors into the curation modal with
// topic + scope pre-filled. Distinct from /guides/[slug] (deeper
// authority guide); the two are linked.

import type { TopicId } from '@/lib/property-modules'

export type SmartCartTopicLanding = {
  slug: string
  topicId: TopicId
  scopeVariantId: string
  metaTitle: string
  metaDescription: string
  h1: string
  subtitle: string
  leadParagraph: string
  /** Short bullets describing what the cart includes. 4-7 items. */
  pickTeaser: string[]
  /** Short bullets describing what the cart skips. 3-5 items. */
  skipTeaser: string[]
  /** Conditions where the cart is the wrong tool — route to pro. 3-5 items. */
  routeOutTeaser: string[]
  /** Primary CTA button label. */
  primaryCtaText: string
  /** Secondary CTA — typically link to contractor / installer page. */
  secondaryCta: { text: string; href: string }
  /** Linked authority guide slug (for /guides/[slug]). */
  relatedGuideSlug: string
}

export const SMART_CART_TOPIC_LANDINGS: Record<string, SmartCartTopicLanding> = {
  'window-weatherization-vermont': {
    slug: 'window-weatherization-vermont',
    topicId: 'weatherization',
    scopeVariantId: 'window_weatherization',
    metaTitle:
      'Window weatherization for Vermont winters — $19.99 product list',
    metaDescription:
      'Close drafts before you replace windows. A $19.99 product list of film, weatherstripping, caulk, and draft control to buy a winter and decide whether replacement is actually needed.',
    h1: 'Window weatherization for Vermont winters.',
    subtitle:
      'A $19.99 product list that helps close drafts for one winter — before you decide whether replacement is worth it.',
    leadParagraph:
      "Vermont winters expose every weak window. The instinct is to replace, and replacement runs $800-$1,500 per window. Most pre-1990 Vermont windows have intact frames and air-leak problems that $80-$220 of weatherization closes for one winter. This is the curated kit.",
    pickTeaser: [
      'Interior shrink-film window kit (covers 4-6 windows)',
      'Weatherstripping appropriate for double-hung sashes',
      'Caulk and sealant for small gaps + a smoothing tool',
      'Draft detector or smoke pencil for testing as you work',
      'Insulated curtain or thermal liner (functional, not designer)',
      'Door sweep or adjacent draft-control product',
    ],
    skipTeaser: [
      'Custom acrylic interior storm inserts ($400+/window — premium when film does 80% of the job)',
      'Designer insulated curtains ($150-300/window — same R-value as $40 thermal liner)',
      '"Premium" weatherstripping at 5x the price of standard V-strip',
      'Replacement quotes for windows that don\'t need replacing',
    ],
    routeOutTeaser: [
      'Visible rot in window frames or sashes — hire a window installer',
      'Broken glass, failed sash, or non-operable window — repair or replacement',
      'Single-pane in a long-term primary residence with comfort/energy as the goal — consider replacement or storm windows',
    ],
    primaryCtaText: 'Get the $19.99 window weatherization Smart Cart',
    secondaryCta: {
      text: 'Need a window installer instead?',
      href: '/contractors',
    },
    relatedGuideSlug: 'window-film-vs-replacement-vermont',
  },

  'basement-moisture-prep': {
    slug: 'basement-moisture-prep',
    topicId: 'home_repair',
    scopeVariantId: 'basement_moisture_prep',
    metaTitle: 'Basement moisture prep before finishing — $19.99 product list',
    metaDescription:
      "A $19.99 product list for checking humidity, leaks, alarms, and water risk before finishing a basement. Diagnostic tools, not repair tools — find problems before they're walled in.",
    h1: 'Basement moisture prep before finishing.',
    subtitle:
      'A $19.99 product list for checking humidity, leaks, alarms, and water risk before you finish a basement.',
    leadParagraph:
      "Finishing a Vermont basement runs $20,000-$50,000. The math only works if the basement stays dry. Vermont basements develop musty smells over winter, hold high humidity in summer, and occasionally take water during snowmelt. This $80-$300 diagnostic kit tells you whether the space is dry enough to finish — before you commit to the bigger project.",
    pickTeaser: [
      'Digital hygrometer (single sensor or 3-pack for whole-basement coverage)',
      'Pin or pinless moisture meter for surface readings',
      'Battery or WiFi water alarm for the leak-prone zones',
      'Properly-sized dehumidifier (typically 50-pint for Vermont basements)',
      'Mold test kit for screening (with the caveat that screening is not diagnosis)',
      'Vapor barrier or storage protection for items currently in the basement',
    ],
    skipTeaser: [
      'Premium whole-basement dehumidifier systems before measuring humidity',
      'Finishing materials before moisture testing',
      '"Mold-killing" foggers and sprays (don\'t address moisture sources)',
      'Whole-house humidifier add-ons (basement is the wrong scope)',
      'Premium "smart" mold sensors that just screen humidity (the hygrometer already does that)',
    ],
    routeOutTeaser: [
      'Standing water or active leaks during rain — call a waterproofing specialist',
      'Visible mold on framing or finished surfaces — call a mold remediation pro',
      'Foundation cracks wider than 1/8 inch, stair-step cracks, bowing walls, or repeated water entry — call a foundation specialist',
      'Recurring dampness that won\'t drop below 65% even with dehumidification — diagnose before finishing',
    ],
    primaryCtaText: 'Get the $19.99 basement moisture prep Smart Cart',
    secondaryCta: {
      text: 'Need a basement / waterproofing pro?',
      href: '/basement-finishing-vermont',
    },
    relatedGuideSlug: 'before-finishing-basement-moisture-checks-vermont',
  },
}

export const SMART_CART_TOPIC_SLUGS = Object.keys(SMART_CART_TOPIC_LANDINGS)
