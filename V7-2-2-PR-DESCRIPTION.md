# v7.2.2 — Modal hotfix + admin cart debug endpoint

Ships the v7.2.1 modal-race hotfix and a new admin cart debug endpoint so we can verify v1 vs v2 routing post-deploy. **Catalog ingestion (Sections 4–7 of the spec) is NOT in this PR** — see DECISION NEEDED below.

**Base branch:** v7.1 (v7.2.1 PR is still open and unmerged at the time of writing). When v7.2.1 lands on main, rebase this branch onto main.

**DO NOT MERGE.** Open as draft. Review on Vercel preview.

## What shipped

### Hotfix (Section 2)
- **Modal race condition fix** in `src/components/CurationModal.tsx` — adds `explicitlySetScopeRef` so the open handler can mark a `data-curation-modal-scope` value as intentional and the topic-change effect honors it instead of stomping back to `list[0]`. The ref consumes itself on first read so subsequent in-modal topic switches still auto-default. Resets on close.
- **Scope variant reorder** in `src/lib/scope-variants.ts` — `kitchen_organizers` leads the kitchen array; `outdoor_lake_season` leads the outdoor array. Belt-and-suspenders for any path that opens the modal without an explicit scope.
- **Admin cart debug endpoint** at `GET /api/admin/cart/[cartId]?adminToken=<ADMIN_REFUND_TOKEN>` — returns `version`, `topic`, `scopeVariantId`, `scenario`, `selectedTier`, `alreadyHave`, slot/skip counts, redacted email, refund flag. KV key is `smartcart:${cartId}` (the spec sketch's `cart:${cartId}` was incorrect — using the actual key from `storage.ts`).
- **v7-diag** gets an informational `admin_cart_endpoint` check that documents the new surface.

### Catalog ingestion (Sections 4-7)
**Not in this PR.** See DECISION NEEDED.

## DECISION NEEDED

- [ ] **Catalog prose content for the three new scopes (`kitchen_cosmetic_refresh`, `kitchen_cabinet_hardware_swap`, `outdoor_lake_season`) was referenced in the v7.2.2 spec as "in the attached chat transcript" but the transcript was not included with the spec.** Constraint #8 explicitly forbids paraphrasing or "cleaning up" the prose, and only the verified ASINs and teaser totals were provided inline in the spec.

  Without the actual slot labels, product names for non-ASIN slots, prices, `productSpec`/`whyThis`/`whyNotCheaper`/`whyNotPremium`/`contextNote`/`warnings` prose, citations, and skip-item text, I cannot transcribe verbatim. Adding empty stub catalogs would register them in `isV2Combination` and route real purchases to broken (zero-slot) carts — exactly the routing failure mode this PR is meant to prevent.

  **Action:** paste the catalog content into a follow-up message. Once received, I'll create:
  - `src/content/smart-cart/kitchen-cosmetic-refresh/` (slots.ts + skip-list.ts) — 9 slots, 11 skip items
  - `src/content/smart-cart/kitchen-cabinet-hardware-swap/` (slots.ts + skip-list.ts) — 6 slots, 10 skip items
  - `src/content/smart-cart/outdoor-lake-season/` (slots.ts + skip-list.ts) — 12 slots, 14 skip items
  - Catalog registry entries in `src/content/smart-cart/index.ts`
  - Verification tests at `src/lib/__tests__/buildSmartCartV2.test.ts`
  - Intent-config teaser updates per Section 6

  Note: v7.2.1 actually shipped `kitchen-organizers/` as a folder (`slots.ts` + `skip-list.ts`), not the flat `kitchen-organizers.ts` file the v7.2.2 spec assumed. I'll match the v7.2.1 folder pattern for consistency.

## Verification results

- [x] `npm run build` green (voice-regression test passes)
- [x] `npx tsc --noEmit` clean
- [x] Modal race fix traced through code (manual review — explicit ref pattern, resets on consume + on close, doesn't break in-modal topic switches)
- [x] Admin endpoint route compiled (visible as `/api/admin/cart/[cartId]` in build output)
- [ ] `/api/admin/cart/CART-LPJK8M` returns `version: 1` against Vercel preview — not run from this environment; please verify with `curl "$BASE/api/admin/cart/CART-LPJK8M?adminToken=$ADMIN" | jq .` after preview deploy
- [ ] kitchen_organizers v2 path test — deferred until verification harness lands with catalog content
- [ ] kitchen_cosmetic_refresh v2 path test — blocked
- [ ] kitchen_cabinet_hardware_swap v2 path test — blocked
- [ ] outdoor_lake_season v2 path test — blocked

## Decisions made on the agent's behalf

- Used `getSmartCart()` from `@/lib/storage` instead of raw `kv.get('cart:...')`. The spec sketch had the wrong key prefix; reusing the helper keeps the admin endpoint in lockstep with the rest of the storage layer (TTL handling, AnySmartCart union, etc.).
- Did not invent placeholder catalog content. Constraint #8 forbids paraphrasing; constraint #6 mandates that legacy carts continue to render. Empty stub catalogs would violate the spirit of both.
- Did not modify v7.2.1's `kitchen-organizers/` folder structure to match the spec's flat-file assumption — preserving v7.2.1 as-is is safer than renaming files mid-stream. New catalogs (when content lands) will follow the existing folder pattern.

## TBD / follow-up

When catalog content arrives, ship as v7.2.2-followup or roll into v7.2.3:
- Three new scope catalogs + verification tests + teaser updates
- Top 10 category combinations from chat (deck_refresh, mudroom_kit, lighting_swap, weatherization, faucet_swap, garden_starter, pantry_focus, fire_pit, mudroom_entry, bathroom_refresh) — see `top-10-category-combinations.md`
- Multi-agent loop infrastructure for catalog scaling (deferred to v7.3 per spec)
- Vermont contractor verification for moat claims
- Real product image URLs (catalog needs `imageUrl` field)
- Inline Smart Cart inside Worth-It dashboard (when Worth-It returns)
- ESLint config wired so `npm run lint` passes non-interactively (still missing as of v7.2.1)

## Manual Stripe tasks

None.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
