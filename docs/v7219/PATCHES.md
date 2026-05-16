# v7.2.19 — Manual Patch Instructions

Three live-revenue surfaces that should be edited by hand rather than file-replaced.

## PATCH 1: Refund consistency sweep

Find-and-replace across the repo:
- "24-hour refund" → "30-day refund"
- "24-hour full refund" → "30-day refund"
- "24-hour window" → "30-day window"

Files known to contain old refund text:
- `src/lib/smart-cart-context.ts`
- `src/app/smart-cart/page.tsx` (the 24-hour banner near top)
- Other files surfaced by grep

Where hardcoded, import from `@/lib/constants`:

```ts
import { REFUND_POLICY_FULL, REFUND_POLICY_SHORT } from '@/lib/constants'
```

## PATCH 2: Add ContractorDiyBanner to contractor pages

Path-aware via `usePathname()`. Drop above-fold:

1. `src/app/window-replacement-vermont/page.tsx`
2. `src/app/basement-finishing-vermont/page.tsx`
3. `src/app/bathroom-remodeling-vermont/page.tsx`
4. `src/app/deck-builders-stowe-vt/page.tsx`
5. `src/app/painting-contractors-vermont/page.tsx`
6. `src/app/hvac-contractors-vermont/page.tsx`
7. `src/app/general-contractors-vermont/page.tsx`
8. `src/app/home-additions-vermont/page.tsx`
9. `src/app/roofing-contractors-vermont/page.tsx`

Pattern:

```tsx
import ContractorDiyBanner from '@/components/ContractorDiyBanner'
// ... after the H1 hero, before the main contractor listing:
<ContractorDiyBanner />
```

## PATCH 3: Title/meta rewrites on contractor pages

Per-page metadata updates per the v7.2.19 spec. 7 pages: window-replacement-vermont, basement-finishing-vermont, bathroom-remodeling-vermont, deck-builders-stowe-vt, general-contractors-vermont, hvac-contractors-vermont, painting-contractors-vermont.

## PATCH 4: GSC URL Inspection (external — not in repo)

15 URLs across 2 days. See full deploy script comment block.

## PATCH 5: Wire pre_listing_curb_appeal into scope registry

Scope payload is in `src/lib/scope-pre-listing-curb-appeal.ts` in a flat shape (picks/optional/skips/waitList/routeOuts). The actual catalog system uses `ScopeCatalog` with `slots` and `tierQueries` resolving against universe products. Translation required — same as the A2/A3 approach in v7.2.18.

For curb appeal, the universe has no matching products today (mulch, paint, edging, etc. are not tagged in `universe.ts`). Either:
- (a) Add new universe entries for each role + new function tags, then author a ScopeCatalog with tierQueries
- (b) Author a degenerate ScopeCatalog with hardcoded copy in `whyThis` prose — won't synthesize a real cart

## PATCH 6: Stripe webhook → GA4 events

Touches live Stripe webhook handler. Awaiting confirmation on auth + endpoint approach before touching.
