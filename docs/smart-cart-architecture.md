# Smart Cart V2 architecture (v7.2.3+)

Hybrid universe + scope-catalog model. Replaces the v7.2.1/v7.2.2 pattern of embedding product data inside per-scope slot definitions.

## Why hybrid

Two layers because the failure modes are different:

- **Universe** — single tagged product table. Holds product-level facts: ASIN, prices, productSpec, affiliate URL, tags. Fact authoring is product-by-product; tags are how we retrieve.
- **Scope catalogs** — editorial layer. Hold slot ordering, crossover prose (whyThis / whyNotCheaper / whyNotPremium / contextNote / warnings), skip lists, scenario defaults. Reference universe by tag query.

Why not universe-only:
- Skip lists are scope-specific (the "Top Knobs trap" reads differently in `cabinet_hardware_swap` vs `cosmetic_refresh`).
- `whyThis` prose changes per scope ("Polywood anchors a lake property" vs "Polywood handles deck wind exposure").
- Slot ordering is scope-specific.

The universe is the product layer. The scope catalog is the editorial layer. Builder joins the two.

## File layout

```
src/lib/
  smart-cart-model.ts          # CartSlot, SmartCartV2Output (output) + ScopeCatalog* (source)
  smart-cart-universe.ts       # UniverseProduct, UniverseQuery, queryUniverse
  buildSmartCartV2.ts          # builder: dependency-injected (input, catalog, universe)

src/content/smart-cart/
  index.ts                     # registry: getCatalog, getUniverse, isV2Combination, getScenarioDefaults
  universe.ts                  # all migrated products + the FN function-tag constants
  scope-catalogs/
    kitchen-organizers.ts      # one file per (topic, scope) combination
    ... (more catalogs land here)

src/app/api/admin/
  cart/[cartId]/route.ts       # v7.2.2 — inspect a stored cart's routing fields
  universe/route.ts            # v7.2.3 — aggregate universe stats
  v723-verify/route.ts         # v7.2.3 — runtime cart-equivalence checks
  v7-diag/route.ts             # universe_loaded / catalogs_loaded / migration_audit checks
```

## Cart synthesis flow

1. `buildSmartCartV2(input, catalog, universe)` is called with topic, scope, scenario, selectedTier, alreadyHave.
2. Filter scope-catalog slots whose `conditionalOn` intersects `alreadyHave`. Empty `conditionalOn` = always visible.
3. For each visible slot, run its `tierQueries.{budget,sweet_spot,premium}` against the universe via `queryUniverse(universe, query, alreadyHave)`. Sweet-spot is required; budget and premium are optional.
4. Compose `CartSlot` objects: tier variants from queries + scope-specific prose.
5. Pull skip list from scope catalog. Sort by `amountSaved.high` desc. Cap at 14.
6. Compute savings (math unchanged from v7.2.1).
7. Return `SmartCartV2Output` with the same shape as v7.2.1.

## Universe ID convention

Lowercase snake-case from brand + model words:

- `pipishell_bamboo_drawer_organizer` (brand-prefixed)
- `rev_a_shelf_5wb2_2122cr_two_tier`
- `kitchen_lid_organizer__everie_extendable_food_container_lid_organizer` (slot-prefixed when brand is unclear or generic)

Why the convention matters: universe IDs are stable references. Renaming an ID is a breaking change to any saved cart that holds the old ID (none today — carts hold the resolved variant, not the ID — but if we add per-cart history snapshots in v7.3+, IDs become user-visible).

## Tag categories

| Category | Type | Notes |
|---|---|---|
| `topics` | enum | kitchen, outdoor, mudroom, bathroom, weatherization, home_repair |
| `roles` | enum | tool, hardware, finish, furniture, fixture, organizer, etc. |
| `functions` | open string-set | The "what does it do" facet — `cabinet_pull`, `lazy_susan`, `adirondack_chair`. Adding a function = adding a constant in `universe.ts`'s `FN` table. |
| `seasons` | enum | spring/summer/fall/winter + mud_season + opening_season + closing_season |
| `propertyTypes` | enum | urban/suburban/rural/lake/coastal/mountain/cabin/condo |
| `conditions` | open string-set | Cabinet/site conditions (`has_corner_cabinet`, `has_p_trap`). All required when listed in a query. |
| `alreadyHaveFlag` | string | One per product. The slot's `conditionalOn` array hides the slot; this flag drops the product when matched even if the slot is visible. |
| `tier` | enum | budget / sweet_spot / premium — exact match in queries |

Match semantics:
- AND across categories (a query with `mustHaveTopics` and `mustHaveFunctions` requires both).
- OR within an array (`mustHaveTopics: ['kitchen', 'outdoor']` matches either topic).
- `mustHaveConditions`: ALL listed conditions must be present (AND inside the array — different from other categories).

## Adding a new scope

Checklist:

1. **Scope variant exists in `src/lib/scope-variants.ts`?** If not, add it. (See v7.2.1 entries for reference.)
2. **Identify products needed.** Walk the slots; for each slot, identify the budget / sweet_spot / premium variant. Check if any of them are already in `universe.ts` (cross-scope sharing — e.g. an Amerock pull lives once and is referenced by both `kitchen_cosmetic_refresh` and `kitchen_cabinet_hardware_swap`).
3. **For each new product**, add a `UniverseProduct` to `UNIVERSE` in `src/content/smart-cart/universe.ts`:
   - Generate a `universeId` per convention (brand-prefixed if recognizable, else `${slotId}__${slug}`).
   - Set `rank: 100` unless there's a reason to prefer one product over another within tier.
   - Tag aggressively. Better to over-tag than under-tag — query precision is in the scope catalog.
   - Add a function constant to the `FN` table at the top of `universe.ts` if the role is new.
4. **Create the scope catalog** at `src/content/smart-cart/scope-catalogs/{scope-id}.ts`:
   - Export `const {SCOPE}: ScopeCatalog`.
   - Slots: define `slotId`, `slotLabel`, `slotKind`, `conditionalOn`, `tierQueries` (one query per tier present), and full editorial prose.
   - Skip list: copy/author scope-specific items.
   - Scenario defaults: one entry per scenario the catalog serves.
5. **Register** in `src/content/smart-cart/index.ts`'s `CATALOGS` array.
6. **Verify**:
   - `npx tsc --noEmit`
   - `npm run build`
   - Hit `/api/admin/v723-verify?adminToken=...` against the Vercel preview; confirm `pass: true`
   - Hit `/api/admin/universe?adminToken=...` to see updated stats

## Adding a new product to an existing scope

1. Verify Amazon ASIN exists and is correct (or use search-query URL via `buildAmazonUrl()`).
2. Capture price range, `productSpec`, citations.
3. Generate `universeId` per convention.
4. Tag with topics, roles, functions, seasons, propertyTypes, conditions, `alreadyHaveFlag`, tier.
5. Append to `UNIVERSE` array. If the scope catalog's existing tier query already matches your tags (same `mustHaveFunctions` + `tier`), no scope-catalog change is needed — `rank` controls preference.

## Verification gates

| Gate | What it checks | Where |
|---|---|---|
| `npx tsc --noEmit` | Type compatibility | Local |
| `npm run build` | Voice regression + production build | Local + CI |
| `/api/admin/v7-diag` | Env vars, KV, Stripe, Resend, universe presence, catalog count, migration audit | Vercel preview |
| `/api/admin/v723-verify` | Cart equivalence: every (catalog × scenario) builds, slots resolve, savings sane, alreadyHave filtering works | Vercel preview |
| `/api/admin/universe` | Aggregate stats — used to track universe growth across releases | Vercel preview |
| `/api/admin/cart/[cartId]` | Per-cart routing inspection (v1 vs v2, scope, scenario, slot count, redacted email) | Vercel preview / production |
| `src/lib/__tests__/v723-migration.test.ts` | Jest-compatible duplicate of `v723-verify` checks. Lights up when Jest is added. | Local (when Jest installed) |

## Back-compat with v7.2.1/v7.2.2 records

- Legacy v1 carts (no `version` field): storage's `getSmartCart` returns the union; `isV2Cart()` returns false; result page renders the v1 layout.
- v2 carts written before v7.2.3 (no `citations` on slots/skip-items): the new optional `citations` fields are absent. Renders unchanged.
- `SmartCartV2Output` shape is unchanged. The result page consumes the same fields.

## What v7.2.3 explicitly did NOT change

- Stripe webhook flow (just threads new arguments into existing v2 builder call)
- v1 legacy cart rendering
- Worth-It (still paused per v7.2.1)
- Pricing ($19.99 unchanged)
- Result page UI (renders the same `SmartCartV2Output`)
- Buyer-facing experience
