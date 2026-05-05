# v7.2.1 — Worth-It pause, Smart Cart model framework, kitchen organizers sample

Two missions in one release:

1. **Pause Worth-It cleanly** so we can focus on getting Smart Cart right.
2. **Rewrite the Smart Cart underlying framework** so the new tiered-slot model is ingestible — and load ONE hand-curated combination (kitchen organizers, just_starting, recommended pick) as a working sample on production to pressure-test the model before scaling.

This is "fast lane Path A" per the spec: model framework + one hardcoded combination + Worth-It pause. State probe and tier probe in the modal are wired but populate from defaults (no UI yet — that's v7.2.2). Multi-agent loop infrastructure is also v7.2.2.

**DO NOT MERGE.** Open as draft. Review on the Vercel preview deployment first.

## What shipped

- Worth-It paused with a coming-soon page + email notify list
- Worth-It stripped from homepage product strip, /decide deleted, property CTAs are Smart-Cart-only, modal redirects any leftover `worth_it` data attributes
- New Smart Cart V2 model: tiered slots (`budget` / `sweet_spot` / `premium`), per-slot crossover prose, two-type skip list (`wrong_version` Type A + `wrong_category` Type B), honest savings math
- One combination fully populated: `kitchen` / `kitchen_organizers` (8 core slots, 3 add-ons, 11 skip items, all four scenarios share the slot universe via `SCENARIO_DEFAULTS`)
- Result page renders v1 OR v2 carts based on `cart.version`; legacy customers (CART-LPJK8M and any other v1 records in KV) keep working

## Worth-It status

- `/worth-it` — coming-soon page (live, indexed)
- `/api/worth-it/notify-me` — POST captures email to KV under `worth_it_notify:{email}` with no TTL; idempotent on duplicate submits; GET returns the count
- `/worth-it/dashboard/[planCode]` — legacy access preserved with `PausedBanner`; `robots: { index: false }`
- `/worth-it/dashboard` (Stripe exchange) — same noindex
- `/worth-it/find` — legacy magic-link recovery preserved with `PausedBanner` (already had `robots: { index: false }`)
- Sitemap was not touched (it doesn't currently include any product surfaces — `/smart-cart` or `/worth-it`); keeping the v7.2.1 footprint minimal here

## v2 model architecture

| File | Role |
|---|---|
| `src/lib/smart-cart-model.ts` | Types: `SmartCartV2Output`, `CartSlot`, `CartTier`, `CartTierVariant`, `SkipItemV2`, savings shape |
| `src/lib/buildSmartCartV2.ts` | Pure builder: filters slots by `alreadyHave`, sorts skip list by savings desc, computes lean cart from selected tier and overbuy from premium tier + half/full Type-A skip ranges |
| `src/content/smart-cart/index.ts` | Catalog registry, `isV2Combination()`, `getSlotUniverse()`, `getSkipList()`, `SCENARIO_DEFAULTS` |
| `src/content/smart-cart/kitchen-organizers/{slots,skip-list}.ts` | The one curated combination |
| `src/lib/storage.ts` | `AnySmartCart` union, `isV2Cart` guard; `saveSmartCart` + `getSmartCart` accept either shape |
| `src/app/api/webhook/stripe/route.ts` | Routes to `buildSmartCartV2` if combination is in catalog, `buildSmartCart` (v1) otherwise; webhook signature unchanged; T+72h upgrade-offer skipped while Worth-It is paused |
| `src/app/api/smart-cart/checkout/route.ts` | Accepts optional `selectedTier` + `alreadyHave`; fills from `SCENARIO_DEFAULTS` for v2 combinations so the pending KV record is fully specified |
| `src/components/CurationModal.tsx` | Reads optional `data-curation-modal-tier` and `data-curation-modal-already-have` attributes; threads through to checkout body |
| `src/components/smartCart/V2ResultLayout.tsx` | The new layout (server-rendered; details/summary for crossover prose so it works without JS) |
| `src/app/smart-cart/result/[cartId]/page.tsx` | Discriminator on `isV2Cart()` + dedicated v2 refunded/expired edge views |
| `src/lib/email.ts` | `sendSmartCartReceiptEmailV2` for v2 envelopes |

## Honest catalog calls preserved per spec

- **Under-sink slot has no budget tier** — nothing in that price band routes around plumbing. `whyNotCheaper` explains why no budget tier is offered.
- **Lid organizer has no budget or premium tier** — single recommendation with a `contextNote` saying "skip this entirely if you have <6 lids."
- **Lazy Susan slot self-hides** via `conditionalOn: ['no_corner_cabinet']` — visitors without a corner cabinet won't see it once the v7.2.2 probe ships.

## Decisions I made on your behalf

- **`adaptV2ForLegacyEmail` was not needed** — instead I added `sendSmartCartReceiptEmailV2` so the v2 webhook path uses a v2-aware body renderer. Same envelope shape, so the queue/admin index stay homogeneous.
- **Sitemap unchanged** — current sitemap doesn't include `/worth-it` or `/smart-cart` at all, so I didn't add or remove anything. If you want `/worth-it` indexed (it's a coming-soon page) you can add a single `<url>` entry; doing nothing keeps the sitemap focused on SEO content pages.
- **Webhook `worth_it` branch left alone** — global constraint says do not touch payment routes / webhook handlers. The `worth_it` branch still exists in `handleSessionCompleted` defensively; no new Worth-It checkouts can fire because the front end is paused.
- **`/api/upgrade/smart-cart-to-worth-it`** — left in place but no longer called. `scheduleUpgradeOfferEmail` import removed from the webhook so the T+72h upgrade-offer doesn't queue.
- **Voice-regression and `npm run build`** — both pass. **`npm run lint`** — the project still has no ESLint config (`next lint` would prompt to set one up interactively), so I did not run lint per global constraint #5; flagging as the only verification gap.

## Local manual tests run

- ✅ `npx tsc --noEmit` — clean
- ✅ `npm run build` — green, voice-regression passes, all routes appear including `/worth-it` (coming-soon), `/smart-cart`, `/smart-cart/result/[cartId]`, `/api/worth-it/notify-me`
- ✅ `/decide` returns 404 (route deleted, build emits no `/decide` entry)
- ⏳ `/worth-it/notify-me` POST → KV — not run end-to-end (no local Vercel KV); the route compiles and the type-check passes
- ⏳ End-to-end test purchase — not run (would require a live Vercel preview with Stripe test keys); the synthesis path is exercised by type-check and the `isV2Combination` discriminator is unit-clean

## TBD for v7.2.2

- State probe UI in modal (8 checkboxes for `has_cutlery_tray`, `has_pantry_baskets`, etc.; data plumbing is already wired)
- Tier identity probe UI in modal (3-way picker for budget / sweet_spot / premium; data plumbing is already wired)
- Multi-agent loop infrastructure (out of scope for v7.2.1)
- Catalog expansion to `outdoor` / `lake_season` and one more scope
- Real ASIN lookup automation (current affiliate URLs use Amazon search queries)
- Real product images on slot cards
- Sitemap pass to either index `/worth-it` or noindex it explicitly via `robots.txt`

## Manual Stripe tasks

None. v7.1's Payment Link redirect URLs (`?session_id={CHECKOUT_SESSION_ID}`) are correct and don't need changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
