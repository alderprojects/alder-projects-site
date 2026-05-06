# v7.2.5 — Schema migration + 9 new scope catalogs

Major architecture and content expansion. Schema additions reshape what
Smart Cart can express; content additions take coverage from 4 catalogs
(82 products) to **13 catalogs (203 products)** across the highest-value
Vermont seasonal-home scenarios. One additional scope (`mudroom_entry_reset`)
is structurally declared and ingestion-ready but its source content was not
delivered with v7.2.5 and ships in a follow-up.

> **Base branch:** `v7.2.4` (or `main` if v7.2.4 has merged).
> Rebase onto main once v7.2.4 lands. **DO NOT MERGE before v7.2.4.**

## Schema additions (paste 1)

### Product-level fields on `UniverseProduct` (all optional)
- `costBenefitClaim` — structured "Spend X to prevent Y" copy
- `vermontReasoning` — soft Vermont-specific framing (public-data only)
- `customerIntent` — buyer-intent routing
- `ifAlreadyHaveNextBest` — next-best recommendation when product is owned
- `doNotRecommendIf` — exclusion conditions

### Tag fields on `UniverseTags` (all optional)
- `valueMechanism` — what value the product creates (10 enum values)
- `executionLane` — `diy_first` / `small_pro` / `contractor_worthy` / `verify_first` / `hold`
- `replacementCycle` — `one_time` / `seasonal` / `annual` / `every_3_5_years` / `as_needed`
- `affiliateFit`, `trustRisk` — internal categorization
- `urgencyWindow` — buy-by date with `daysRemaining` computation
- `bundleWith` — paired-product references

### Type-union extensions
- `UniverseTopic += 'universal'`
- `UniverseRole += sensor, monitor, cleaner, preventer, document_aid, measurement_tool`
- `UniverseSeason += pre_winter, pre_summer, year_round`
- `TopicId += mudroom, home_repair, universal` (closed union widened to match the universe enum)
- `BriefScenarioId += absentee_owner, pre_winter_prep, spring_opening, mud_season`
- 5 cascading `Record<TopicId,...>` / `Record<BriefScenarioId,...>` maps widened (CurationModal, EmailCaptureCard, InlineCta, property-modules, scenarios, builder)

### Scope catalog extensions
- `smartCartPromise`, `primaryCustomerPain`, `valueProposition`
- `routeOutRules` — when to redirect to Worth-It / pro / contractor / verify-first
- `seasonalUrgency` — scope-level buy-by window

### Slot extensions on `ScopeCatalogSlot`
- `slotPurpose`, `whyItMatters`, `commonMistake`
- `nextBestIfAlreadyHave`, `whenToSkip`, `routeOutOfSmartCartIf`
- (Mirrored as optional source-authoring carryover on `CartSlot` so v7.2.2-shape source files can declare them inline; the ingestion script normalizes them into `ScopeCatalogSlot` at write time)

### Output extensions on `SmartCartV2Output`
- `routedOut` — short-circuit cart with redirect message
- `bundlePrompts` — "buy these together" surfaces
- `nextBestGaps` — `alreadyHave`-driven recommendations
- `urgencyBanner` — top-of-page deadline callout
- All optional — v2 carts saved before v7.2.5 continue to render unchanged

### Architecture additions
- `topic: 'universal'` — cross-project scopes (owner kit, project prep)
- `scenario: 'absentee_owner'` — Vermont second-home reality
- 9 new scope variants in `scope-variants.ts` (with empty `mudroom`/`home_repair`/`universal` topic arrays added so `SCOPE_VARIANTS` stays exhaustive over `TopicId`)
- ~80 new function tag constants in `FN` export

## Content additions (pastes 2–4)

| Scope | Slots | Skips | Topic |
|---|---|---|---|
| outdoor_freeze_prevention | 9 | 10 | outdoor |
| outdoor_seasonal_opening | 8 | 9 | outdoor |
| outdoor_deck_refresh | 8 | 10 | outdoor |
| universal_owner_kit | 10 | 9 | universal |
| home_moisture_control | 7 | 8 | home_repair |
| home_water_quality | 8 | 8 | home_repair |
| outdoor_dock_lake | 8 | 8 | outdoor |
| home_safety_kit | 6 | 8 | home_repair |
| universal_project_prep | 7 | 7 | universal |
| **TOTAL NEW (9 scopes)** | **71** | **77** | — |
| _mudroom_entry_reset_ | _8_ | _9_ | _mudroom_ — pending source |

Combined with v7.2.4's 4 catalogs, the registry now serves
**13 scope catalogs** with **109 slots** and **121 skip items**
across **203 universe products**.

## Cross-scope universe reuse

Universe additive tag merging let several products serve multiple scopes
rather than duplicate:
- **hOmeLabs 50-pint dehumidifier** + **30-pint dehumidifier** + **Aprilaire whole-house** — outdoor_seasonal_opening + home_moisture_control
- **Govee WiFi leak sensor (H5054)** — outdoor_freeze_prevention + home_moisture_control
- **General Tools MMD4E moisture meter** — outdoor_deck_refresh + home_moisture_control
- **Watersafe All-in-One strips** — outdoor_seasonal_opening + home_water_quality
- **Tap Score Essential + Advanced lab tests** — outdoor_seasonal_opening + home_water_quality
- **Pentek 10" sediment + carbon block** — outdoor_seasonal_opening + home_water_quality
- **Big Blue 4.5"x20" filter housing** — outdoor_seasonal_opening + home_water_quality
- **Generic 10" sediment filter** — outdoor_seasonal_opening + home_water_quality

Net: ~17 universe entries saved from duplication via cross-scope tag merging
(actual; counted from ingestion logs).

## Verified ASINs added in v7.2.5

- Govee WiFi Water Leak Detector 3-pack (B07J9HZ5VN)
- Govee Audible Leak Detector 5-pack (B07QSFRSJX)
- YoLink LoRa Water Leak Starter Kit (B0DWWXJ4MY)
- Frost King 1/2" foam pipe insulation 6ft (B07XLQ5TPG)
- Frost King 3/4" foam pipe insulation 4-pack (B000BQLSBI)
- Frost King 1" rubber pipe insulation 6ft (B003A0YX82)
- Cabot Australian Timber Oil 1 gallon (B000K6HBKG)
- First Alert PRO5 Fire Extinguisher 3-A:40-B:C (B000M2QR8U)

Plus all verified ASINs from v7.2.4 carried forward.

## Tooling — `scripts/ingest-catalog.ts` upgrade

The v7.2.4 ingestion script was substantially upgraded for v7.2.5 (commit
`0eb1366`):

- Reads `_METADATA` exports from source files and writes scope-level
  metadata fields (`smartCartPromise`, `routeOutRules`, `seasonalUrgency`,
  etc.) into the trimmed scope catalog.
- Forwards 6 new slot-level fields (`slotPurpose`, `whyItMatters`,
  `commonMistake`, `nextBestIfAlreadyHave`, `whenToSkip`,
  `routeOutOfSmartCartIf`) into `ScopeCatalogSlot`.
- Adds slot-prefix heuristics for `freeze_*`, `opening_*`, `deck_*`,
  `owner_*`, `moisture_*`, `mudroom_*`, `water_*`, `dock_*`, `safety_*`,
  `prep_*` so the script knows which functions/roles/seasons to derive.
- Expands `KNOWN_BRANDS` for v7.2.5 brands (Govee, YoLink, Frost King,
  Honeywell, Ecobee, Pentair/Pentek, Cabot, Behr, Sun Joe, Generac,
  Marcell, hOmeLabs, Sterilite, Method, Quickie, General Tools,
  Sherwin-Williams, Restore-A-Deck, Moen, Deckmate, GRK, EasyHeat,
  Tap Score, Watersafe, Aprilaire, Big Blue, Home Depot — 28 new).
- **NEW:** `appendUniverseEntries()` writes new entries directly to
  `src/content/smart-cart/universe.ts` before the closing `]`, replacing
  the v7.2.4 manual-paste workflow. Idempotent — `findExistingProduct`
  dedups on subsequent runs.
- `tsx` added as devDependency (the v7.2.4 ingest-catalog.ts header
  noted "npm i -D tsx" as a one-time setup; v7.2.5 makes it actual).

Two cross-scope-reuse correctness bugs in the script were caught during
ingestion and fixed:

1. **Cross-scope topic mismatch** (commit `61235f3`, paste 3):
   `buildTierQuery` was emitting `mustHaveTopics: [source.topic]` while
   the on-disk universe entry from an earlier scope still carried only
   the original topic. The OR-within-category check found no match and
   3 of 7 home_moisture_control slots failed to resolve. Fix: use the
   resolved product's actual tags (which `mergeProductTags` had already
   unioned in memory).

2. **Cross-scope tier mismatch** (commit `a05c9fb`, paste 4): same shape
   for tier. Watersafe strips are `budget` in outdoor_seasonal_opening
   but the home_water_quality source declares them as `sweet_spot`. The
   strict-equality tier check failed at runtime. Fix: query asks for
   the entry's canonical tier; the slot's `CartSlot.tiers.X` assignment
   presents the resolved product as the X-tier pick for the new scope,
   regardless of canonical storage tier.

Both fixes are documented inline in the script.

## What didn't change

- `SmartCartV2Output` shape backwards compatible — new fields are all
  optional, existing v2 carts continue to render
- Result page UI — new fields available but not yet surfaced; result-page
  UI updates deferred to post-merge cleanup
- v1 legacy carts (CART-LPJK8M etc.) still render via v1 path
- Stripe webhook flow
- Worth-It (still paused)
- Pricing ($19.99 unchanged)

## Verification gates (Vercel preview)

Replace `<preview-url>` with the actual Vercel preview URL.

```bash
BASE="https://<preview-url>.vercel.app"
ADMIN="$ADMIN_REFUND_TOKEN"

# 1. Merge gate — expect pass: true, catalogCount: 13
curl "$BASE/api/admin/v723-verify?adminToken=$ADMIN" | jq .
# Expect:
#   pass: true
#   universeSize: 203
#   catalogCount: 13
#   schemaAudit.universalProductCount: > 0
#   failures: []  (informational notices may be present and are filtered out of `pass`)

# 2. Universe stats
curl "$BASE/api/admin/universe?adminToken=$ADMIN" | jq .
# Expect total: 203

# 3. Legacy v1 cart still v1
curl "$BASE/api/admin/cart/CART-LPJK8M?adminToken=$ADMIN" | jq '.version'
# Expect: 1

# 4. v7-diag
curl "$BASE/api/admin/v7-diag?adminToken=$ADMIN" \
  | jq '.checks[] | select(.id | startswith("universe") or startswith("catalogs"))'
```

Local pre-push verification (no admin token required):

```bash
npx tsc --noEmit                                      # typecheck
npm run build                                         # full Next build
# Per-catalog runtime check (all 13 catalogs / 109 slots resolve):
npx tsx <(cat <<'EOF'
import { buildSmartCartV2 } from './src/lib/buildSmartCartV2'
import { getAllCatalogs, getUniverse } from './src/content/smart-cart'
const u = getUniverse(), cs = getAllCatalogs()
console.log(`Universe: ${u.length}, Catalogs: ${cs.length}`)
let f = 0
for (const c of cs) {
  const cart = buildSmartCartV2({ cartId:'X', topic:c.topic, scopeVariantId:c.scopeVariantId,
    scenario:c.scenarios[0], customerEmail:'x@x', selectedTier:'sweet_spot', alreadyHave:[] }, c, u)
  const ok = cart.slots.length === c.slots.length &&
    cart.slots.every(s => s.tiers.sweet_spot?.affiliateUrl.includes('amazon.com'))
  console.log(`${ok?'OK':'FAIL'} ${c.scopeVariantId}: ${cart.slots.length}/${c.slots.length}`)
  if (!ok) f++
}
process.exit(f === 0 ? 0 : 1)
EOF
)
```

## Real Stripe test purchases needed before promotion

- kitchen + kitchen_organizers + just_starting (regression check)
- outdoor + outdoor_freeze_prevention + absentee_owner (new scope, new scenario)
- outdoor + outdoor_seasonal_opening + just_starting (new scope)
- outdoor + outdoor_deck_refresh + already_have_basics (new scope, alreadyHave path)
- universal + universal_owner_kit + just_starting (new topic)
- home_repair + home_moisture_control + just_starting (new topic)
- home_repair + home_water_quality + just_starting (new scope)
- outdoor + outdoor_dock_lake + lake_property (new scope)
- home_repair + home_safety_kit + just_starting (new scope)
- universal + universal_project_prep + just_starting (new scope)

Each purchase should:
- Render v2 layout in result page (no fall-through to v1)
- Show populated slots (no empty cart)
- Display correct slot count vs `EXPECTED_STATS`
- Show correct skip list count

## Pragmatic decisions documented

1. **`mudroom_entry_reset` not shipped in this PR.** Source content for
   the scope was not delivered with v7.2.5. Schema extensions, scope-
   variant declaration, FN constants, and ingestion-script heuristics
   are all in place — when source lands, ingestion is a single command
   (`npx tsx scripts/ingest-catalog.ts --source scripts/source-catalogs/mudroom-entry-reset.ts`)
   followed by registration + `EXPECTED_STATS` (8/9 per spec) + `smartCartReady` flip.
   No structural change required.

2. **`home_moisture_control` mold-test slot restructured.** Original source
   had a placeholder "Professional mold inspection" sweet_spot tier with
   an `alderprojects.com` route-out URL, which would have failed the
   verify gate (every sweet_spot must have an `amazon.com` affiliateUrl).
   Per option-A user sign-off: promoted DIY kit (was budget) to sole
   sweet_spot tier. The route-out for visible mold over 10 sq ft is
   preserved via `routeOutOfSmartCartIf`. Slot count for the catalog is 7
   (same as if the placeholder had remained).

3. **`outdoor_dock_lake` route-out destination corrected.** Source used
   `'contractor_worthy'`; paste 1 schema only allows
   `'worth_it' | 'small_pro' | 'contractor' | 'verify_first'`. Mapped
   to `'contractor'` (closest fit). Editorial reason text unchanged.

4. **`home_safety_kit` skip-list title fixed.** Source string had
   unescaped single-quotes around `'safety'` inside a single-quoted
   string literal, breaking the parse. Rewrote without the inner quotes.
   Editorial intent unchanged.

5. **`outdoor_freeze_prevention` ships with 10 skip items**, not 11 as
   originally specced. Source as authored has 10. `EXPECTED_STATS` uses
   actual count.

6. **Vermont reasoning kept softened.** Per v7.2.4 decision, no
   contractor-verified Vermont-specific claims. All `vermontReasoning`
   fields use public-data framing (frost depth, growing seasons, mud
   season timing, regional well water concerns from VT DEC publications).
   Sharper Vermont moat returns when contractor verification network
   exists.

7. **Result page UI updates deferred.** New schema fields (`routedOut`,
   `urgencyBanner`, `bundlePrompts`, `nextBestGaps`, `costBenefitClaim`
   per slot, `vermontReasoning` per slot) are available in
   `SmartCartV2Output` but not yet surfaced on
   `/smart-cart/result/[cartId]/page.tsx`. UI work is a separate commit
   after seeing real data shape from Stripe test purchases.

8. **`CurationModal` does not surface `absentee_owner` scenario** as a
   visible option. It's an implicit scenario triggered by intent-config
   or scope catalog defaults. Surfacing as an explicit user choice is a
   homepage/intent-config decision deferred to a separate PR.

## TBD / follow-up for post-v7.2.5

- Land `mudroom_entry_reset` content + registration (single follow-up commit)
- Result page UI updates to surface new fields (route-out cards, urgency
  banners, bundle prompts, next-best gap callouts, Vermont reasoning per
  slot, cost-benefit claims per slot)
- `CurationModal` updates to support `absentee_owner` as visible choice
- Real product image URLs across universe (`imageUrl` field has been
  schema-ready since v7.2.3)
- Vermont contractor verification of moat claims to unlock stronger
  `vermontReasoning` copy
- Inline Smart Cart inside Worth-It dashboard (when Worth-It returns)
- Multi-agent loop infrastructure for catalog scaling beyond manual
  chat-curated approach
- ESLint config wired for non-interactive `npm run lint`

## Manual Stripe tasks

None. Webhook signature unchanged.
