# v7.2.3 — Hybrid universe + scope-catalog refactor

Refactors the v2 Smart Cart model from per-scope embedded products to a hybrid architecture:

- **Universe table** (`src/content/smart-cart/universe.ts`) — single tagged product table holding 22 products with ASIN/price/productSpec.
- **Scope catalogs** (`src/content/smart-cart/scope-catalogs/`) — trimmed, hold scope-specific metadata only (slot order, prose, skip lists, scenario defaults). Reference universe by tag query.
- **Builder** (`src/lib/buildSmartCartV2.ts`) — pulls products via tag query, joins with editorial prose, returns the same `SmartCartV2Output` shape as v7.2.1.

**Result page UI unchanged. Stripe routing unchanged. v1 legacy path unchanged. Zero buyer-facing differences. v7.2.3 is pure infrastructure.**

**Base branch:** `v7.2.2` (still open and unmerged at time of writing). When v7.2.2 lands on main, rebase.

**DO NOT MERGE.** Open as draft. Verify on Vercel preview before merge — the verification gate is `/api/admin/v723-verify`.

## Reality check vs the spec

The v7.2.3 spec assumed v7.2.2 had landed all 4 catalogs (kitchen_organizers + 3 new ones). In code, **only kitchen_organizers exists** — the v7.2.2 catalog ingestion was blocked on missing prose and never merged. Two consequences:

1. The migration is one catalog, not four. The other three plug in cleanly when their prose lands (the architecture is exactly the unblocker).
2. The tests/verify endpoint cover one combination today; they extend trivially as catalogs land.

The framework, types, and registry are full-featured per spec — only the migrated content is a single-catalog scope.

## What changed

| File | Change |
|---|---|
| `src/lib/smart-cart-universe.ts` | NEW — `UniverseProduct`, `UniverseQuery`, `UniverseTags`, `queryUniverse` |
| `src/content/smart-cart/universe.ts` | NEW — 22 products migrated from kitchen_organizers, all with `migratedFrom` provenance |
| `src/content/smart-cart/scope-catalogs/kitchen-organizers.ts` | NEW — trimmed scope catalog (slots + skip + scenarioDefaults), references universe via `tierQueries` |
| `src/lib/smart-cart-model.ts` | EXTENDED — added `ScopeCatalog`, `ScopeCatalogSlot`, `ScopeCatalogSkipItem`, `ScopeCatalogScenarioDefaults`. Existing types unchanged except `citations?` added (optional, back-compat) |
| `src/lib/buildSmartCartV2.ts` | REFACTORED — dependency-injected `(input, catalog, universe)`. Same output shape as v7.2.1 |
| `src/content/smart-cart/index.ts` | REPLACED — `getCatalog`, `getAllCatalogs`, `getUniverse`. `isV2Combination` and `getScenarioDefaults` signatures preserved |
| `src/app/api/webhook/stripe/route.ts` | UPDATED — passes catalog + universe into `buildSmartCartV2` (3 lines added; v1 path unchanged) |
| `src/app/api/admin/universe/route.ts` | NEW — universe stats endpoint |
| `src/app/api/admin/v723-verify/route.ts` | NEW — runtime cart-equivalence checks |
| `src/app/api/admin/v7-diag/route.ts` | EXTENDED — `universe_loaded`, `catalogs_loaded`, `migration_audit`, `admin_universe_endpoint` checks |
| `src/lib/__tests__/v723-migration.test.ts` | NEW — Jest-compatible test suite (lights up when Jest is added) |
| `docs/smart-cart-architecture.md` | NEW — onboarding doc with synthesis flow, ID convention, tag categories, "add a scope" + "add a product" checklists, verification gates table |
| `src/content/smart-cart/kitchen-organizers/{slots,skip-list}.ts` | DELETED — replaced by `universe.ts` + `scope-catalogs/kitchen-organizers.ts` |

## What didn't change

- `SmartCartV2Output` shape — result page UI consumes the same fields
- Stripe webhook flow
- v1 legacy cart rendering (CART-LPJK8M and friends still render)
- Worth-It (still paused)
- Pricing ($19.99 unchanged)
- Buyer-facing experience

## Verification

- [x] `npx tsc --noEmit` clean
- [x] `npm run build` green (voice-regression test passes)
- [x] Universe + scope catalog files type-check; new endpoints visible in build output (`/api/admin/universe`, `/api/admin/v723-verify`)
- [x] All 22 universe entries carry `migratedFrom` provenance
- [x] Universe IDs unique
- [ ] `/api/admin/v7-diag?adminToken=...` shows `universe_loaded ok, catalogs_loaded 1, migration_audit ok` against Vercel preview
- [ ] `/api/admin/v723-verify?adminToken=...` returns `pass: true` against Vercel preview
- [ ] `/api/admin/universe?adminToken=...` returns 22 products against Vercel preview
- [ ] `/api/admin/cart/CART-LPJK8M?adminToken=...` returns `version: 1` (legacy path unchanged)
- [ ] One real v2 test purchase: kitchen + kitchen_organizers + just_starting → renders with v2 layout, all 8 core slots populated, skip list intact

The four `[ ]` items above require a deployed Vercel preview with a valid `ADMIN_REFUND_TOKEN`. Run them before merging to main.

## Decisions made on the agent's behalf

- **One catalog migrated**, not four. The other three from v7.2.2's spec were never authored in code (blocked on prose). The framework now exists for them to plug in directly in the new shape — see `docs/smart-cart-architecture.md` "Adding a new scope" checklist.
- **No migration script.** With only one catalog to migrate, a one-shot `scripts/migrate-catalogs.ts` was overkill. The migration was done by hand and the methodology is documented inline in the universe.ts comments + the migration commit message. Future catalogs author directly into the new shape, so a re-runnable migration script doesn't have a use case.
- **Two-pronged verification** since the project doesn't have Jest installed. The Jest-compatible test file (`src/lib/__tests__/v723-migration.test.ts`) is documentation that lights up unchanged when Jest is added. The runtime endpoint (`/api/admin/v723-verify`) is the actual merge gate — it runs in the same Node runtime the webhook uses.
- **Universe ID convention** locked in: lowercase snake_case from brand+model. Falls back to `${slotId}__${slug}` when brand is unclear (e.g. generic 12-inch lazy susan, magnetic spice tin set). `FN` constants in `universe.ts` document the function-tag namespace so scope catalogs can reference by named constant rather than string-magic.
- **`citations` arrays empty for the migrated content** — v7.2.1's catalog didn't carry per-slot or per-skip citations, so the migration preserves the v7.2.1 fact (no citations) rather than fabricating them. Future catalogs author citations directly.
- **Webhook v1 path untouched.** The v2 branch threads catalog + universe in 3 added lines. The v1 branch and the worth_it branch are unchanged — global Constraint 2 forbids touching the webhook beyond Section 4D's catalog routing.
- **Old `kitchen-organizers/` folder deleted** rather than left as reference. Git history holds the previous state.

## TBD / follow-up for v7.2.4+

- The 3 blocked v7.2.2 catalogs author into the new shape: `kitchen-cosmetic-refresh`, `kitchen-cabinet-hardware-swap`, `outdoor-lake-season`. ASINs from v7.2.2 spec (Amerock B0DLWN5QLH, INSL-X B07KXLPCG1, Polywood B001VNCJ36, Weber B077JTCMKQ, etc.) are ready when prose lands.
- Top 10 category combinations from chat (per v7.2.2 backlog).
- Multi-agent loop infrastructure for catalog scaling (originally scoped for v7.3 — likely accelerates given the universe model is the data shape it needs).
- Real product image URLs (universe schema has `imageUrl` field ready).
- Vermont contractor verification of moat claims.
- Inline Smart Cart inside Worth-It dashboard (when Worth-It returns).
- Jest installation + config so `src/lib/__tests__/v723-migration.test.ts` runs from CI.

## Manual Stripe tasks

None.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
