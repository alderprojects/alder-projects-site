# v7.2.7 — Product images across the universe

Smart Cart result pages now render with images on every product card.
Closes the "wall of text" feedback from the v7.2.6 paid-cart smoke
test.

## What changed for buyers

- Lean cart slot cards: 96–112px product thumbnail to the left of
  product name + price + spec.
- Add-on list rows: 56px thumbnail.
- Missing/broken images fall back to a per-topic SVG icon (no
  broken-image rendering).

## Coverage

| Tier | Source | Count | Share |
|---|---|---|---|
| Tier 1 | Manufacturer product pages (real photos) | 29 | 13.1% |
| Tier 3 | Pexels stock (CATEGORY_GENERIC entries) | 35 | 15.8% |
| Tier 4 | Per-function SVG icons (Lucide MIT) | 77 | 34.7% |
| Tier 4 | Per-topic SVG icons (Lucide MIT) | 81 | 36.5% |
| **Total real photos** | | **64** | **28.8%** |
| **Total fallback icons** | | **158** | **71.2%** |

100% of products have an image. The 158 fallback-icon entries are
split between brand-prominent products on Amazon-only brands
(Pipishell, Ryqtop, DIOLOVE, etc., which have no public corporate
catalog) and entries whose manufacturer pages don't expose `og:image`.
A v7.3+ workstream will source vendor-licensed photography for these.

## Architecture

New scripts (`scripts/images/`):
- `01-audit-products.ts` — classifies entries SPECIFIC / CATEGORY_BRAND
  / CATEGORY_GENERIC / SERVICE
- `02-source-manufacturer.ts` — Tier 1 scraper (robots.txt-respecting,
  identifying User-Agent, per-domain rate limit, og:image / schema.org
  Product image extraction)
- `04-source-pexels.ts` — Tier 3 Pexels client
- `05-source-svg-fallback.ts` — Tier 4 SVG generator (Lucide path data)
- `06-process-images.ts` — sharp resize/WebP/JPG pipeline
- `07-update-universe.ts` — populates `variant.imageUrl` across
  `universe.ts` (idempotent)
- `99-coverage-report.ts` — per-tier + per-topic coverage report

Runtime:
- `src/lib/smart-cart-images.ts` — `resolveImageUrl(variant)` returns
  `variant.imageUrl ?? DEFAULT_IMAGE_URL`
- `src/components/smartCart/ProductImage.tsx` — client component with
  onError fallback to default icon

Schema: `CartTierVariant.imageUrl` was already declared in v7.2.1; this
release populates it.

## Ingest pipeline forward-compatibility

`scripts/ingest-catalog.ts` now auto-populates `variant.imageUrl` on
newly ingested entries based on function/topic SVG fallbacks. The image
sourcing pipeline overwrites with a real photo when one is found.

## Attribution

`ATTRIBUTION.md` documents every image source. Includes a takedown
contact (`hello@alderprojects.com`, one-business-day removal) for
manufacturer-sourced images.

## What is NOT in v7.2.7

- Vendor-licensed photography for Amazon-only brands (~120 entries
  remain on SVG fallback) — separate workstream
- Multiple images per product
- User-uploaded photos
- AI-generated product illustrations
- Amazon PA-API integration (out of scope per Tier 1 cost/benefit)

## Operational notes

- Image assets live at `public/product-images/{universeId}.{webp,jpg}`
- Per-function SVGs at `public/product-images/categories/{fn}.svg`
- Total static-asset weight added: ~3MB (64 × 800×800 WebP @ q85,
  76 small SVGs)
- Re-running the pipeline is idempotent; only changed assets are
  rewritten

## Pre-flight checklist for the PR

- [x] Audit reconciled (222 entries, not 203)
- [x] All 222 entries have non-empty `imageUrl`
- [x] No entries fall to default `_package.svg`
- [x] `ATTRIBUTION.md` covers every Tier 1 + Tier 3 image
- [x] V2ResultLayout renders thumbnails with onError fallback
- [x] Ingest script auto-populates imageUrl for future catalogs
- [ ] `npx tsc --noEmit` clean
- [ ] Visual spot-check (10 random product cards on local dev)
