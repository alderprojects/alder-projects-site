# Build log — v7.4.5 → v7.4.8 (backend monitoring, EXIF, ZIP, consent)

Run: 2026-07-27. All four releases built, tested, merged, and deployed to production.
Source brief numbered these 7.4.2–7.4.5; renumbered because v7.4.2f was already
live and 7.4.3/7.4.4 were claimed by the open PRs (see §0).

| Release | PR | State |
|---|---|---|
| v7.4.5 admin console + EXIF | [#51](https://github.com/alderprojects/alder-projects-site/pull/51) | merged, live, checkpoint passed |
| v7.4.6 ops dashboard | [#52](https://github.com/alderprojects/alder-projects-site/pull/52) | merged, live, checkpoint passed |
| v7.4.7 ZIP regionalization | [#53](https://github.com/alderprojects/alder-projects-site/pull/53) | merged, live, checkpoint passed |
| v7.4.8 consent pipeline | [#54](https://github.com/alderprojects/alder-projects-site/pull/54) | merged, live, **flag off (dark)** |

---

## 0. Pre-flight findings that changed the plan

**The two open PRs were merged first, not stacked or superseded.** #48 (v7.4.3
privacy) and #49 (v7.4.4 admin-lite) were open for founder review. Both were
verified locally on an integration branch (clean merge + green build) and merged
before new work started, because the new console replaces #49's auth model and
the EXIF work touches #48's upload-route changes. Nothing was lost: #49's
`/admin/reports` page was moved behind the new auth rather than rewritten, and
its already-applied `disabledAt` migration is untouched.

**A live GPS leak was found and removed.** §0.3 required verifying EXIF behavior
empirically rather than assuming. Two upload paths existed:

- `src/app/api/photos/upload/route.ts` (the live Check route) — `.rotate()` →
  resize → `.jpeg()`. Verified against installed sharp 0.34.5 with a
  GPS-tagged fixture: **output carries zero EXIF.** Correct already.
- `src/lib/photos/upload.ts` — `.withMetadata({ exif: {} })`, with a comment
  claiming it stripped EXIF. Verified empirically: **that chain PRESERVES the
  input's full EXIF, GPS included.** The file had zero importers, so nothing in
  production ever ran it, but it was a loaded gun pointed at R1. Deleted in
  v7.4.5 rather than fixed.

So §1.3 became "capture the allowed fields before the strip, log the event, add
the schema guard" — plus the deletion above.

**Session entity is `Report`, not `VisitorSession`/`Project`.** The brief predates
the v7.4 Report layer. `Report` is the row that groups a photo set with its
verdicts, so `reviewedAt`/`reviewedBy` and `QAFlag.reportId` hang off it.

**Lane vocabulary is BUY/WAIT/SKIP/INVESTIGATE**, not the brief's
BUY/SKIP/WAIT/MONITOR. Used the live vocabulary everywhere.

**"Signed URLs" are capability URLs + a logged passthrough.** `@vercel/blob` has
no private-ACL mode on this plan; PR #48 established `addRandomSuffix` capability
URLs with no URL exposure. Admin photo access reuses that: `/api/admin/photos/[id]`
checks the allowlist, writes `PHOTO_VIEWED`, then redirects. `Photo.blobUrl`
never appears in admin HTML.

---

## 1. Cardinal rules — how they were held

**R1 (no EXIF GPS, ever).** `captureExifFields()` is the only EXIF reader; it
inspects the GPS IFD for *key presence only* and returns `hadGps: boolean`.
Coordinates are never returned, logged, or persisted. Guard comments sit in
`schema.prisma` and the migration SQL. Verified: `grep -inE 'lat|lng|gps'` over
schema + migration returns only the guard text and `hadGps`. Prod upload of a
GPS-tagged photo → `hadGps=true`, device fields populated, re-downloaded blob has
**no EXIF**.

**R2 (every field serves the consumer).** Two fields were dropped under this rule:

- **Full ZIP in the `ZIP_SUBMITTED` event payload** → reduced to `zip3`. The
  event exists for funnel measurement; the precise ZIP already lives on the
  report where it serves the visitor's own regional accuracy. Full precision in
  the event log would have been duplication for analytics value only.
- **EXIF `Software`/lens fields** — parsed by the library, deliberately not
  persisted. They serve no consumer read; only `capturedAt`, device make/model,
  original dimensions, orientation, and `hadGps` are stored (the exact §1.3 list).

---

## 2. Per-release notes

### v7.4.5 — admin console + EXIF discipline

- Auth reuses the existing Resend magic link; authorization is
  `email ∈ ADMIN_EMAILS`. No roles table. The magic-link request now accepts an
  internal `next` path (sanitized) so admin links land on `/admin`.
- Defense in depth: middleware turns away credential-less requests at the edge;
  the real check (`checkAdmin()` → session → allowlist) runs in the `(console)`
  layout and every `/api/admin` handler.
- `/admin/catalog-review/action/[token]` is explicitly exempt from the middleware
  gate — those pages are clicked from digest emails with no session, and their
  single-use `ReviewActionToken` **is** the auth.
- `/admin/reports` + `/api/admin/reports` migrated off the `?adminToken=` query
  param onto session auth. Other legacy token-authed admin APIs were left alone.
- `AdminAccessLog` is written on every session-detail load and every photo
  issuance, owner account included. Non-allowlisted sign-ins write `DENIED`.

### v7.4.6 — ops dashboard

- **p95 result: no rollup cron needed.** Every dashboard query ran 490–620ms
  locally and **183–231ms on prod**, well under the 2s budget. Per the
  pre-answered decision, `DailyMetrics` was NOT built. Each card renders its own
  query time so a future breach is visible without instrumentation work.
- **Gap found and fixed:** `RESULT_VIEW_SECONDS` / `RESULT_SECTION_ENGAGEMENT`
  were only emitted by the legacy `V3CartView`, not by the live Check report.
  The v7.5 tier decision depends on exactly these two metrics, so they would have
  read zero forever. `ReportView` now emits both. Confirmed live on prod: a real
  report view produced 2 section events + a 39s view event.
- Funnel is anon-keyed and monotonic by construction (each stage is a subset of
  the previous), so the reconciliation invariant can't be violated by data skew.

### v7.4.7 — ZIP regionalization

- Region table is `ZIP3 → state → IECC zone` with ~90 ZIP3 overrides where a
  state clearly spans zones. **Backlog debt recorded:** residual in-state
  granularity (a full IECC county↔ZIP mapping) is deferred; the brief's
  pre-answered fallback allows state-level, and this lands between the two.
- Prompt bumped to `recommend-v1.2.0` with reasoning rule 9. **Eval gate passed:
  `npm run check:eval` 21/21** on the new prompt (the deploy gate for any prompt
  change).
- Divergence proven on one photo: no-ZIP vs VT 05401 vs FL 33101 produced
  materially different guidance (FL added a leak sensor and humid-climate
  framing; VT emphasized moisture batching). **No-ZIP output contained zero
  region claims**, and an automated scan plus manual read found **zero region
  claims in `visible_evidence`** across all three.
- Incidental fix: `reportPayload`'s `buyCount` didn't filter `disabledAt`, so an
  admin-disabled BUY could still inflate the Smart Cart upsell count. Now matches
  `shapeRows`.

### v7.4.8 — consent pipeline (dark)

- **`ConsentRecord` is a new table, and the reason is structural.** The existing
  `Consent` table carries partial UNIQUE indexes on `(userId, purpose, dataType)`
  and `(anonId, purpose, dataType)` — one row per owner+purpose. The brief's
  non-negotiable requirement is that revocation never mutates the granting row
  and re-consent inserts a new row. That is impossible under those uniques.
  Photo-upload consents keep using `Consent`, unchanged.
- **Credit conformance.** The 7.3.7 pricing A/B never shipped a credit primitive,
  and the live gate is a Stripe Payment Link → webhook → `deliverReportCart()`.
  A Payment Link can't be discounted per-visitor, so the credit conforms at the
  **fulfillment** layer: redemption calls the same `deliverReportCart()` the
  webhook calls. One delivery path, two entry points — no parallel cart builder,
  no second email template. Single-use is a conditional update on `redeemedAt`;
  a failed delivery releases the claim so the visitor can retry.
- **Consideration is not blurred.** Address alone → stored, no credit. Address +
  licensing checkbox → `ConsentRecord` + credit. Verified as two distinct
  responses.
- `/terms` ships as a **flag-gated placeholder** that states no terms of its own.
  The consent checkbox is required to link to T&Cs, and a link to a 404 would be
  sloppy even in the dark. **This is a blocker on the flag flip** (see §4).

---

## 3. Deploy-verify checkpoints

All four passed on production.

- **v7.4.5:** real prod upload of a GPS-tagged photo → report → report page 200 →
  `hadGps=true` + device fields + **EXIF-free stored blob** → `EXIF_STRIPPED`
  event → deleted via the product's own delete control. Admin console verified
  on prod with a real Resend magic link.
- **v7.4.6:** dashboard live on prod; the funnel metric cross-checked against a
  hand-run Neon query (22 = 22; extractions 14 = 14).
- **v7.4.7:** prod upload with ZIP → `ZIP_SUBMITTED` event + regionalized output.
- **v7.4.8:** prod deploy with the flag off — `/do-not-sell`, `/terms`, and all
  three new API routes return 404; no footer link; report page contains zero
  address-module markup.
- **Full-series regression (all flags at defaults):** upload → 29.4s report →
  report page → delete. Event trail: `EXIF_STRIPPED{hadGps:true}` →
  `PHOTO_UPLOADED` → `VISION_EXTRACTION_COMPLETED` → `REPORT_GENERATED` (27.8s,
  in line with the 29–35s prod baseline) → `ZIP_SUBMITTED` → `REPORT_DELETED`
  (1 photo, 1 blob, 0 errors). **Consumer experience unchanged.**

All test data created during this run was deleted, blobs included; prod is back
to 1 pre-existing report and 14 pre-existing photos.

---

## 4. Founder actions

1. **Before flipping `ADDRESS_CAPTURE_ENABLED`** (it is not set on Vercel, so it
   defaults to off):
   - Replace `/terms` placeholder content with counsel-reviewed T&Cs.
   - Counsel review of the financial-incentive notice, licensing-consent
     language, and do-not-sell scope (aggregate **and** property-level).
   - Vermont data-broker registration analysis; state-by-state first-party-seller
     obligations.
   - A preview-env demo of the full flow is reproducible by setting the flag on
     any preview deployment.
2. **`ADMIN_EMAILS`** already existed on Vercel (71 days old, marked sensitive so
   its value can't be pulled). Prod `/admin` was verified working with
   `hello@alderprojects.com`, so the value is correct — no action unless you want
   to add addresses.
3. **Still open from the overnight run:** the dead prod KV/Upstash store
   (`KV_*` env vars) and the PA-API credentials. Neither blocks this series.

## 5. Backlog added by this series

- Full IECC county↔ZIP mapping to replace ZIP3 approximations (v7.4.7 debt).
- Parcel enrichment (v7.6) — required to make the v7.4.8 address claim fully
  true; the copy currently claims only record continuity + future accuracy.
- `DailyMetrics` rollup cron — **not** needed (no p95 breach recorded).
