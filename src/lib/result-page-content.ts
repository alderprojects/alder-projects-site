// v7.2.7 — content constants for the upgraded V2 result page.
//
// Catalog-level metadata (smartCartPromise / valueProposition) is
// authored sparsely (5 of 14 catalogs). The "Why these picks?" sidebar
// uses a 4-chip set that describes Smart Cart as a product — always
// true across scopes. The catalog's smartCartPromise renders as a
// single-line context above the chips when present.

export interface ValuePropChip {
  /** Short title (3-5 words). */
  title: string
  /** Sentence-fragment body. */
  body: string
}

/**
 * The 4 chips shown in the WhyThesePicks sidebar. These describe what
 * Smart Cart does as a product — true for every scope. We do not show
 * scope-specific chips here because catalog-level value-prop copy is
 * authored as a single narrative, not as 4 parallel claims.
 */
export const SMART_CART_VALUE_PROPS: ValuePropChip[] = [
  {
    title: 'Right size for most homes',
    body: 'Picks fit standard drawers, doors, and cabinets.',
  },
  {
    title: 'Better quality, better value',
    body: 'Sweet-spot picks last; budget tier traps avoided.',
  },
  {
    title: 'Avoids early remodel spending',
    body: 'Improvements first — bigger projects later, on purpose.',
  },
  {
    title: 'Saves time and extra trips',
    body: 'Cart works as a set, not a string of one-off purchases.',
  },
]
