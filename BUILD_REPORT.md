# Morning report — RecScore + Auto-Eval + Commerce Resolution

Run: 2026-07-27 → 2026-07-28, unattended. **Both phases completed and deployed.** No aborts, no reverts.

| Phase | Shipped as | PR | Prod |
|---|---|---|---|
| 1 · RecScore + Auto-Eval | **v7.4.9** | [#55](https://github.com/alderprojects/alder-projects-site/pull/55) | live, Checkpoint 1 passed |
| 2 · Commerce Resolution | **v7.4.10** | [#56](https://github.com/alderprojects/alder-projects-site/pull/56) | live, Checkpoint 2 passed |

**Numbering:** the package said v7.4.6/v7.4.7, but v7.4.8 shipped in the previous session, so these went out as **v7.4.9** and **v7.4.10**. The package's internal cross-references map: "7.4.2 admin surfaces" → v7.4.5, "7.4.3 dashboard" → v7.4.6, "7.4.4 regionContext" → v7.4.7, "7.4.5 credit" → v7.4.8.

---

## Two things need your attention

### 1. PA-API keys are NOT in Vercel — Phase 2 shipped in search-link mode

Owner lock #1 said the keys were "in Vercel env and tested." They are not, in any environment:

```
$ vercel env ls production | grep AMAZON
AMAZON_PAAPI_ASSOCIATE_TAG
AMAZON_PAAPI_REGION
```

`AMAZON_PAAPI_ACCESS_KEY` and `AMAZON_PAAPI_SECRET_KEY` don't exist, and the live `SearchItems` smoke test returns 0 items. The wiring in `paapi.ts` is correct and reads the standard names — the credentials themselves are missing, and I can't mint Amazon credentials. §0.4 pre-answered this exact case ("if unfixable, Phase 2 runs in search-link mode and the report says so"), so that's what shipped.

**What this costs:** every BUY/WAIT item currently resolves to a tagged Amazon *search* link with a brand illustration, instead of a specific product with its official photo and price. Links work and earn; the cards just aren't specific yet. **Add the two env vars and ASIN mode activates with no code change or redeploy of logic** — the match scorer, image handling, price/"as of" rendering and cache are all built and unit-tested.

**What couldn't be tested:** the §2-T accuracy sample ("20 real historical BUY items resolved; every ASIN-mode hit hand-verified") cannot run without the API. The match scorer is covered by unit fixtures instead — exact type+size clears the 0.75 floor, a wrong product type scores 0.19, ordering holds, output is deterministic.

### 2. A calibration bug I shipped and then caught in live testing

My first GroundingScore implementation read §1.2 as "mean extraction confidence." On the first real synthesis, **three fully-cited items scored 0.725–0.775 and were suppressed** — not for fabricating anything, but because vision-model confidence naturally sits there. A 4-item report collapsed to 1, and the mass-suppression retry doubled latency to 64s.

§1.2 actually specifies the *share* of claims traceable, **weighted by** confidence — confidence is the weight, not the value. Corrected so a traced claim earns `min(1, conf/0.7)` credit and an uncited claim contributes 0. One fabricated claim in four still yields 0.75 and trips the floor, which is the intent.

Re-verified live: 3 items, 0 suppressions, 28.6s, scoring 42ms. **This is why the live checkpoint exists** — 29 unit tests all passed against the wrong formula, because they encoded my misreading.

---

## Phase 1 — v7.4.9 test results (§1-T)

| Check | Result |
|---|---|
| Determinism — identical inputs → byte-identical sub-scores | **PASS** |
| Gate — planted ungrounded claim suppressed + event logged | **PASS** (3 real suppressions observed live, page rendered cleanly) |
| CR2 mechanical — tie-break 0.5 rejected by config validation | **PASS** |
| CR2 — tie-break on SKIP/WAIT ignored (returns 0) | **PASS** |
| CR1 — zero floor rejected; `grounding` as a weight rejected | **PASS** |
| Priors — n=2 → neutral 0.5 | **PASS** |
| Priors — n=20 @80% like → hand-computed 0.75 | **PASS** |
| Immutability — pre-v7.4.9 rows still `null`, new rows versioned | **PASS** (verified by SQL on prod) |
| Judge cache — second run makes zero model calls | **PASS** (1 cache hit / 0 calls) |
| Auto-demotion — rule created past threshold | **PASS** |
| Auto-demotion — 6th+ candidate blocked by weekly cap | **PASS** (5 created, 2 blocked + reported) |
| Auto-demotion — revoke restores | **PASS** |
| Emails — daily + weekly render against real data | **PASS** (screenshots below) |
| Emails — zero-activity day sends nothing | **PASS** |
| Serve-path latency < 100ms | **PASS — 42ms local, 31ms prod** |

**Totals: 29 unit + 17 DB assertions, 0 failures** (`npm run score:test`).

**Deploy-verify checkpoint 1 (prod):** real upload → scored synthesis → scores visible in the admin score-breakdown panel with per-claim grounding ✓/✗ marks. SQL smokes:
```
compositeScore | scoreVersion      | suppressed
0.5008         | recscore-v1.0.0   | false
0.5802         | recscore-v1.0.0   | false
0.6010         | recscore-v1.0.0   | false
0.5772         | recscore-v1.0.0   | false
null           | null              | false   ← pre-v7.4.9 rows unchanged (CR3)
```
`SELECT * FROM "CurationRule" WHERE "revokedAt" IS NULL` → 0 rows (no reaction data at threshold yet). Exactly one email system live, verified.

### Auto-rules created this run
**None on prod.** The auto-curation pass ran and found no signature meeting >40% doesn't-apply at n≥8 — there isn't enough reaction data yet. The mechanism is verified against seeded fixtures (5 created, 2 correctly blocked by the weekly cap, each carrying its evidence numbers). The first real rules will appear in a daily digest with their evidence, as specified.

---

## Phase 2 — v7.4.10 test results (§2-T)

| Check | Result |
|---|---|
| Accuracy sample (20 ASIN hits hand-verified) | **NOT RUN** — no PA-API credentials (see above) |
| Match scorer — exact type+size clears floor | **PASS** (0.79 ≥ 0.75) |
| Match scorer — wrong product type far below floor | **PASS** (0.19) |
| Confidence gate — vague "some caulk" → SEARCH + illustration | **PASS** |
| CR4 — SKIP/INVESTIGATE never resolved, no card, no link | **PASS** (DOM-asserted on prod) |
| CR4 — WAIT: illustration, no CTA, no product price | **PASS** (DOM-asserted on prod) |
| CR5 — only two image sources in the render path | **PASS** (0 third-source images in prod HTML) |
| Freshness — price never renders without "as of" | **PASS** (structural — same conditional) |
| Quota drill — API unavailable → still renders in search mode | **PASS** + `PRODUCT_RESOLUTION_FALLBACK` logged |
| Disclosure on both surfaces | **PASS** |
| specHash caching — identical specs resolve once | **PASS** (order-insensitive) |

**Totals: 28 assertions, 0 failures.**

**Deploy-verify checkpoint 2 (prod):** real session → cards live on the result page. Lane behavior:
```
BUY          score=0.5638  resolution=SEARCH cat=sealants_caulk
SKIP         score=0.5989  resolution=NONE
SKIP         score=0.5380  resolution=NONE
INVESTIGATE  score=0.5380  resolution=NONE
```
`SELECT "resolutionMode", COUNT(*) FROM "ResolvedProduct" GROUP BY 1` → `SEARCH: 2` (correct with no API keys).

### First link-coverage numbers
On the checkpoint session: **1 of 1 BUY items linked (100% coverage), 0% ASIN / 100% SEARCH.** The dashboard card now tracks this continuously (ASIN vs SEARCH vs none, mode mix, clicks by lane, fallback rate). Expect ASIN share to jump from 0% the moment credentials land.

---

## Screenshots

Captured during the run (in-session):
1. **Daily scoreboard email** — metrics table, deep-linked judge flag, judge cache counter, "the numbers below are the proof, not a summary."
2. **Weekly rollup email** — WoW deltas, top-3/bottom-3 scored items with admin deep links, active rules, drift watch.
3. **Illustration set** — all 10 categories, vivid and muted variants side by side.
4. **Result page WAIT card** (local) — illustration, WAIT badge, wait-until framing, no CTA.
5. **Result page BUY card (prod)** — caulk illustration, BUY badge, "paintable exterior/interior window caulk", spec line, "View on Amazon →" utility link.

Note: the cart email's card treatment (hosted images + bulletproof button + disclosure) is built and compiles, but **a real cart email was not received this run** — that requires a completed $19.99 Stripe purchase, which I did not transact. The Gmail/Apple Mail rendering verification for the cart email is outstanding.

---

## Judgment calls

- **CR4 "no prices" on SKIP/MONITOR** — SKIP/INVESTIGATE still show the *dataset cost range* ("this would run $400–1500, and it's still not worth it"). I read CR4's no-prices rule as governing *commerce* prices (product price + "as of"), which `ProductCard` gates to BUY only; the cost range is the diagnostic's own content and the core of the honesty proposition. Flagging in case you meant it more strictly — it's a one-line change.
- **MONITOR → INVESTIGATE** — the package says MONITOR; the live Check vocabulary is BUY/WAIT/SKIP/**INVESTIGATE** (`LearningStore` still carries a legacy MONITOR lane). All MONITOR rules were applied to INVESTIGATE.
- **AffiliateClick is an event, not a table** — there is no `AffiliateClick` model. The existing mechanism is the `AFFILIATE_CLICKED` EventLog event; §2.5's "conform to it" was implemented by extending its payload with `sessionId`, `verdict`, `lanePosition` and `resolutionMode` rather than creating a parallel table.
- **Legacy digest flag-off** — `DISABLE_DIGEST_EMAIL` already existed in Vercel *and was advertised in that email's own footer*, but the code never read it. Now it does, and it's set to `true` on prod. One-line revert: flip it to `false`. Its pending catalog counts are embedded in the new scoreboard so nothing was lost, though the one-click approve/reject tokens now only issue if you re-enable it.
- **Claim→feature persistence did not exist** (§0.2) and was built first, as instructed: observations are numbered in the prompt, each evidence claim cites `feature_refs`, and the linkage persists as `claimLinksJson`. Prompt version `recommend-v1.3.0`.
- **Judge sampling** stays off — daily volume is far below the 500-session threshold, so coverage is 100%.

---

## Outstanding / your call

1. **Add `AMAZON_PAAPI_ACCESS_KEY` + `AMAZON_PAAPI_SECRET_KEY` to Vercel** — this is the single highest-value action; it converts every card from a search link to a specific product with photo and price, and unblocks the §2-T accuracy sample.
2. **Cart email rendering in Gmail/Apple Mail** — needs one real purchase to verify end to end.
3. Still open from earlier runs and unaffected by this one: dead prod KV (`KV_*`), the 5-fixture founder eval, editorial review of the 12 standing verdicts.
4. `ADDRESS_CAPTURE_ENABLED` remains unset (v7.4.8 stays dark pending counsel).

## Numbers

- 2 PRs merged, 2 migrations applied, 0 reverts.
- **74 test assertions** across three suites, all passing (`npm run score:test`).
- Prod serve-path scoring: **31ms** (budget 100ms). Report latency unchanged at ~29–35s.
- Dashboard queries: 183–231ms — still no rollup cron needed.
- All test data created during the run was deleted, blobs included.
