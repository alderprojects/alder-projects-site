# Morning report — v7.4.13 Home Record + Coverage Map

Run: 2026-07-28 overnight, unattended. Branch `v7.4.13-home-record`, 2 commits.
**Partial run. Foundation complete and tested; five of nine build phases not
started. Nothing deployed, nothing written to production.**

The prior `BUILD_REPORT.md` (v7.4.9/7.4.10) is left intact; this report is
versioned alongside it, matching the `BUILD-LOG-v7.4.5-v7.4.8.md` precedent.

---

## Read this first: three pre-flight findings that change the spec

§0 pre-flight was where these surfaced. None is a checkpoint failure, so the
abort protocol did not trigger — but two of them mean parts of the locked
spec are building for conditions that do not currently exist.

### 1. Production has one Check. The backfill has nothing to backfill.

Queried the `production` branch of the Neon project directly (it is the only
branch; `.env.local` points at it):

| | count |
|---|---|
| `Report` (all time) | **1** |
| `Report` with a captured email | **1** |
| `Photo` | 16 |
| `Recommendation` | 6 |
| `VisitorSession` | 29 (all 2026-07-26 → 07-28) |
| `User` | 4 |
| `EventLog` | 697 |

The one report was created 2026-07-27 — the day before this run.

This does not block the release, but it invalidates the stated rationale for
three locked items:

- **Locked decision #3 (historical backfill / endowed progress).** "Every
  returning user starts partially lit, not at zero" describes a returning
  user base that does not exist. The backfill job will create exactly one
  `HomeRecord`. §2's "spot-check 3 records by hand in admin" cannot be
  performed. "Median starting coverage" over n=1 is not a statistic.
- **§1.6 `ASSESSMENT_INTEREST` as "the empirical demand signal for the v7.5
  pricing decision."** At current volume this yields roughly zero taps. The
  event is cheap and worth shipping for later, but it will not inform a
  pricing decision on any near timeline.
- **§1.6 the 9/9 Summary itself.** It requires 31 slot-tagged shots across
  nine systems from a single household. It is the most complex component in
  the spec — queued job, grounding gate, regeneration, email — and it serves
  a state no one can currently reach.

The parts that *do* pay off at n=1 are the schema, the mapping, the record
page, and the nudges, because they change what a **new** user sees from their
very first read. Those are what this run built.

**Recommendation:** ship the foundation, defer the Summary generator until a
record actually approaches full depth, and treat the backfill as a one-record
smoke test rather than a migration.

### 2. `PhotoQualityScore` could not gate slots "verbatim" as §0.2 specified

`photoQualityScore()` in `src/lib/score/score.ts` takes an
`EnrichedRecommendation` and reads its `claimLinks`. It is a per-recommendation
metric, stored in `Recommendation.subScoresJson`. A coverage slot asks a
different question — *did this photo actually show the thing* — whose evidence
is extraction features, not recommendation claims. Gating an attic slot on a
strong water-heater recommendation's score would be a category error. Worse for
the backfill: `scoreItems()` writes all-zero sub-scores for suppressed items,
so the stored value would gate slots on a number that means something else.

**Resolved without a second metric,** per the spirit of §0.2: the formula is
extracted into `qualityFromObservations(confidences, distinctCount)`, and both
callers delegate to it. One implementation, two substrates. A unit test asserts
the two agree numerically.

### 3. The feature vocabulary is open, so the mapping keys off the closed enum

`src/lib/vision/prompt.ts` instructs the model to "invent new types when none
of the example types fit." `features[].type` is therefore free vocabulary, and
it sprawls: **57 distinct types across 16 photos**, including these real
synonym pairs in production —

```
caulk_failing_window / window_caulk_failing
refrigerator_present / refrigerator_visible
tile_grout_staining  / tile_grout_discoloration
exposed_wiring       / exposed_electrical_wiring
kitchen_countertop_visible / _clean / _condition / countertop_condition
```

A mapping table keyed on `type` equality would have been fiction. But
`category_hint` **is** a closed enum (`CATEGORY_VALUES`, 20 values, model must
pick one). So the table keys on `category_hint` as primary, with regex
signatures over `type` as refinement, and cross-cutting signatures taking
precedence over room-of-capture (a panel is Electrical whether shot in a
basement or a garage). No invented feature names — §0.4 satisfied.

**Consequence worth knowing:** slot-level *depth* is mostly **not inferable**
from organic photos. The slots are shots ("panel, door open" vs "panel
labeling") and the vocabulary has no concept of framing — both yield
`electrical_panel_visible`. Depth fills reliably only via the slot-tagged
"Read this" flow, where the user tells us what they shot. Untagged photos
credit the system through a generic slot that adds **breadth but not depth**.
This is implemented honestly rather than papered over.

### Bonus: pre-existing schema drift, fixed

`Report_zip_idx` has existed on production since the v7.4.7 migration but was
never declared in `schema.prisma`. Every `prisma migrate diff` since
2026-07-27 has therefore proposed **dropping a live index** — including the
first draft of this release's migration. Re-declared `@@index([zip])`; the
migration is now additive-only. Worth knowing before the next migration.

---

## What shipped (branch only, not deployed)

| Component | File | State |
|---|---|---|
| CoverageSchema v1 — 9 systems / 31 slots | `src/lib/coverage/schema.ts` | done |
| Slot mapping table | `src/lib/coverage/mapping.ts` | done, validated on real data |
| CR3 quality gate + coaching | `src/lib/coverage/quality.ts` | done |
| Shared quality formula | `src/lib/score/score.ts` | refactored |
| Derived state (lit/aging/stale, breadth/depth, 9/9) | `src/lib/coverage/state.ts` | done |
| Record service (create-or-attach, fill, events) | `src/lib/coverage/record.ts` | done, **not wired in** |
| Seasonal ordering (CR2) | `src/lib/coverage/order.ts` | done |
| Data model | `prisma/schema.prisma` | done |
| Migration (5 tables, additive) | `prisma/migrations/20260729010000_v7_4_13_home_record/` | generated, **not applied** |
| `/record` page | `src/app/record/page.tsx` | done |
| House cutaway map | `src/components/record/CoverageMap.tsx` | done |
| System panels + next-up strip | `src/components/record/RecordView.tsx` | done |
| Unit suite (51 assertions) | `scripts/coverage/unit-tests.ts` | **51/51 pass** |
| Read-only mapping dry run | `scripts/coverage/dry-run.ts` | done |

`npm run coverage:test` · `npm run coverage:dryrun`

## What did NOT get built

Phases 3–9 of the build sequence. Listed plainly so nothing reads as done:

- **Claim-flow integration.** `attachReportToRecord()` and
  `fillSlotsForReport()` exist and are tested, but **nothing calls them yet**.
  They are not wired into email capture or the synthesis path. This is the
  single most important next step — without it no record is ever created.
- **Backfill job** (§1.3) — not written. Would create 1 record.
- **Nudges** (§1.5) — post-result module, anonymous email-capture line, and
  the cart/result email footer: none built.
- **Whole-Home Summary** (§1.6) — generator, queued job, grounding gate,
  regeneration, bridge CTA, `ASSESSMENT_INTEREST` wiring: none built. Event
  names are defined in `COVERAGE_EVENTS` but only the slot events fire.
- **Instrumentation** (§1.7) — dashboard and daily-digest additions: not built.
- **Deploy** — no prod deploy, no migration applied, no Resend email sent.

## Verification actually performed

- `npx tsc --noEmit` → **0 errors**
- `npm run coverage:test` → **51/51 pass**, covering: schema shape; CR1
  fear-vocabulary grep over all schema and coaching copy; CR2 (out-of-window
  system fills in July with no penalty); CR3 floor, coaching band, and the
  "one metric, two substrates" equality; mapping precedence, synonym
  resolution, honest non-mapping, tagged-upload short-circuit; the 8/10/13-month
  aging boundaries; and CR4 — a planted stale system blocks completeness.
- **CR5 gate, live:** unauthenticated `GET /record` → `307` to
  `/account/sign-in?next=/record`. `/record` compiled clean (590 modules).
- **Mapping against real production data** (read-only, no writes):

```
── report cms30jjc00001sk0iy3mgi8o6  (1 photo, 2026-07-27)
   2 of 9 systems · 2 of 31 shots
     Electrical: 1/3   ✓ A representative outlet   q=0.722
     Bath:       1/3   ✓ Exhaust fan               q=0.748  (+ generic)
   coached (near-miss, no fill):
     · bath/tub_shower_surround (0.651) — Almost. The wall surface and the
       corners where it meets the tub or pan. Retake?

   features seen: 6 · mapped: 6 (100.0%) · unmapped: 0
```

That is the whole loop working on real data: features map, the CR3 floor
fills two slots, and a genuine near-miss produces coaching with a concrete fix.

**Not verified:** no screenshots of lit/dark/aging states. Rendering a
populated map requires `HomeRecord` rows, which requires applying the
migration and writing records to production. I did not do that for a release
whose code is not deployed — it would have left five empty tables and test
rows on prod for no benefit.

## Cardinal rules

- **CR1** — no condition scores, no red states. The palette's `RED` is unused
  on the record surface by construction. Enforced by a test over every schema
  string and every generated coaching message.
- **CR2** — `window` is read by exactly one module (`order.ts`) and only ever
  sorts. Asserted.
- **CR3** — `SLOT_QUALITY_FLOOR` 0.7 (env-overridable), one shared metric,
  near-miss coaching, session still gets its normal read.
- **CR4** — completeness requires every slot present and non-stale; a planted
  stale system blocks it. The Summary generator that would consume this is
  not built.
- **CR5** — `/record` is behind `getCurrentUser()`, `robots: noindex`, no
  public variant, no completeness in any unauthenticated surface. Verified
  live. *Not yet applicable:* signed photo URLs — the panel does not render
  thumbnails yet, deliberately, rather than shipping an unsigned path.

## Recommended next session

1. Wire `attachReportToRecord()` + `fillSlotsForReport()` into email capture
   and the synthesis path. Nothing works until this exists.
2. Apply the migration and deploy together with #1.
3. Nudges (§1.5) — highest leverage at current volume, since they are what
   make a first-time reader want a record at all.
4. Hold the Summary generator and the backfill until there is a record with
   real depth to summarize.
