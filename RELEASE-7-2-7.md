# v7.2.7 — Product images + cost/benefit-forward result page

Two-PR release that takes the Smart Cart result page from a text-list
to a visual cost/benefit decision document. Closes the wall-of-text
feedback from the v7.2.6 paid-cart smoke test.

## Part A — Image pipeline (PR #10, merged)

Every product in the cart now renders with an image.

**Coverage on 222 universe entries:**

| Tier | Source | Count | Share |
|---|---|---|---|
| Tier 1 | Manufacturer product pages (real photos) | 29 | 13.1% |
| Tier 3 | Pexels stock (CATEGORY_GENERIC entries only) | 35 | 15.8% |
| Tier 4 | Per-function SVG icons (Lucide MIT) | 77 | 34.7% |
| Tier 4 | Per-topic SVG icons (Lucide MIT) | 81 | 36.5% |
| **Real photos** | | **64** | **28.8%** |
| **Fallback icons** | | **158** | **71.2%** |

100% of products have an image. The 158 fallback-icon entries are
mostly brand-prominent products on Amazon-only brands (Pipishell,
Ryqtop, DIOLOVE, etc., which have no public corporate catalog with
`og:image`); v7.3+ vendor outreach will source licensed photography
to replace them.

**What got dropped from the original plan:**

- Tier 2 (Wikimedia Commons) — realistic hit rate against this catalog
  would be 3–5 of 222; not worth the pipeline complexity. Defer.
- Manufacturer-scraping legal framing — the original plan invoked
  "nominative fair use" (a trademark doctrine, wrong for copyright).
  ATTRIBUTION.md instead documents each fetch with source URL + date
  and a one-business-day takedown contact (`hello@alderprojects.com`).
  No claim of license; rights holders can request removal directly.

**Pipeline (`scripts/images/`):** audit, manufacturer scraper with
robots.txt + identifying User-Agent + per-domain rate limit, Pexels
client, SVG generator, sharp resize/WebP/JPG, idempotent universe
updater, coverage report. `ingest-catalog.ts` auto-populates
`imageUrl` on newly ingested entries.

## Part B — Result-page UI refinement (this PR)

Refactor `V2ResultLayout` into a cost/benefit-forward layout with a
two-column desktop shell.

**Structure:**

- Header (unchanged) → TitleBlock → conditional banners (Urgency,
  Route-out)
- ValueProofBar (top-of-body savings strip)
- Two-column body (mobile collapses to single column):
  - **Main column (2/3):** RecommendedPicks → Add-ons → Bundle
    prompts → Skip-for-now → Already-have
  - **Sticky sidebar (1/3):** CartSummary → WhyThesePicks →
    NotQuiteRight (respin)
- CrossSellComingSoon (unchanged)

**RecommendedPickCard** is the new core component. Per pick:
- Numbered badge + image with Category tag overlay (when image is an
  SVG fallback)
- Product name, price range, tier label
- Italic productSpec line + parsed callout chips (≤3 short fragments
  via `extractSpecCallouts`)
- Benefit chips: "Better than the cheapest" (when budget tier
  exists), "Skip premium for most homes" (when premium tier exists
  and `whyNotPremium` is authored), `costBenefitClaim` chip (when
  present)
- Why-this prose
- Why-not-cheaper / why-not-premium expandables (data-gated)
- Warnings, contextNote, vermontReasoning (data-gated)

**Sidebar:**

- **CartSummary:** items count, estimated total range, estimated
  savings range. Prominent "Estimates only" footnote.
- **WhyThesePicks:** the catalog's `smartCartPromise` (when present)
  + 4 always-true Smart Cart chips (Right size for most homes /
  Better quality, better value / Avoids early remodel spending /
  Saves time and extra trips). The mockup's per-scope chip set was
  trimmed back: catalog `valueProposition` is authored as narrative,
  not 4 parallel claims, so we don't fabricate chip text.
- **NotQuiteRight:** uses the existing CartActions component for
  respin (already shipped).

## Compliance commitments held throughout

- **No invented review counts, ratings, popularity numbers.** The
  mockup showed "4.7 · 42,000+ reviews" — we don't have that data.
  Cut entirely.
- **No promised home valuation impact.** Requires v7.3.5+ photo +
  property-graph integration. Not in scope.
- **No fake urgency or stock counts.** UrgencyBanner only renders
  from public-data deadlines (frost dates, opening seasons) at
  `cart.urgencyBanner.daysRemaining < 30`.
- **Estimated savings always shown as range, never as guarantee.**
  ValueProofBar suppresses entirely when `potentialSavingsHigh`
  doesn't exceed the $19.99 product price.
- **Vermont reasoning stays at catalog level.** Personalized "for
  your Vermont home at X elevation" is v7.3.x (PropertyProfile
  attachment).
- **Manufacturer images include a takedown contact.** Documented per
  source in `ATTRIBUTION.md`. No "fair use" overclaim.

## What's NOT in v7.2.7

- Product reviews / ratings (no review-data integration)
- Save-for-later persistence (no real account state — stays a v7.3.1
  feature)
- Live lead routing to pros/contractors (route-out CTAs in
  RouteOutBanner are mailto placeholders for now; wires up in v7.4)
- A/B testing infrastructure
- Property-graph-personalized Vermont reasoning

## Files added (Part B)

- `src/lib/result-page-content.ts` — Smart Cart value-prop chips
- `src/lib/spec-callouts.ts` — productSpec → callout fragments
- `src/components/smartCart/chips/{BenefitChip,WarningChip,CategoryTag}.tsx`
- `src/components/smartCart/sections/{ValueProofBar,RecommendedPicksSection,RecommendedPickCard,AddOnSection,SkipForNowSection,AlreadyHaveSection,CartSummary,WhyThesePicks,NotQuiteRight,RouteOutBanner,UrgencyBanner,BundlePromptsSection}.tsx`

## Verification

- `npx tsc --noEmit` — clean
- `npm run build` — clean (next build + voice regression test)
- Production smoke (Part A): images deliver 200 from
  `/product-images/{universeId}.webp` and category fallbacks from
  `/product-images/categories/_*.svg`
- Visual review (Part B): pending human eyes on
  `https://alderprojects.com/smart-cart/result/{cartId}` after merge

## Tag

After Part B merges:

```
git tag v7.2.7
git push origin v7.2.7
```
