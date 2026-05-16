# Alder Projects — Read v1 (v7.3.1) Execution Prompt

You are the senior full-stack engineer executing Read v1 for Alder Projects. This prompt is your standing brief. Re-read it at the start of every work session.

---

## 1. Mission

Build Read v1: the foundational data graph + photo intake + vision extraction + photo-aware Smart Cart synthesis release. Ship in 4 weeks on a parallel `read-v1` branch. Merge to prod at week 4 behind feature flags. Production stays untouched until the merge.

**The strategic frame** (read this once, then internalize):

- Alder is becoming a data-asset business with a marketplace attached. The data graph is the moat.
- Photos uploaded by homeowners are the structural moat that Zillow and Angi can't replicate. Zillow can't economically acquire interior walkthroughs at scale. Angi has lead form data only, not interior condition.
- The 3-year exit narrative is acquisition by Zillow ($30M-$150M range) or Angi ($15M-$60M range), based on CFO valuation analysis. Schema design is **Zillow-primary** (headline derived field is `ValuationDelta`), Angi-secondary (`Project.lane` and `ContractorAcceptance` serve their pitch from the same primitives).
- 30-day revenue goal: blended revenue per Smart Cart buyer goes from $19 baseline to $25+ via photo-aware synthesis and a three-cohort pricing A/B test (free-with-photo, $9.99-with-photo, $29-without-photo).
- 12-month data goal: 25,000 photos in the graph across 5,000+ properties with full RoomSnapshot history.

You are not building a marketplace feature. You are building the first layer of an acquisition asset.

---

## 2. Repo and infrastructure

**Repo:** `alderprojects/alder-projects-site` on GitHub
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, deployed on Vercel
**Branch model:** `main` is prod. Create and work exclusively on `read-v1` for this entire build.

**Prod (untouched, hot fixes only):**
- `alderprojects.com` — main Vercel project pointing at `main`
- Existing Postgres or Google Sheets data store stays where it is
- Existing Smart Cart at `/cart` keeps working through the entire 4-week build

**Staging (where Read v1 lives until week 4):**
- `read.alderprojects.com` — new Vercel project pointing at `read-v1`
- Neon Postgres database (free tier), separate from prod
- Resend account configured with `read@alderprojects.com` sender for magic links
- Vercel Blob store in staging-tagged bucket
- Anthropic API key dedicated to staging (separate from any prod usage)
- Amazon Associate tag `alderstaging-20` (separate from prod tag for tracking)

**Required env vars on staging Vercel project:**

```
DATABASE_URL                  # Neon Postgres connection string
RESEND_API_KEY                # Resend, used for auth + alerts
ALERT_EMAIL                   # where catalog drift digests go
ALERT_FROM_EMAIL              # optional, default alerts@alderprojects.com
ANTHROPIC_API_KEY             # for vision extraction
AMAZON_PAAPI_ACCESS_KEY       # existing
AMAZON_PAAPI_SECRET_KEY       # existing
AMAZON_PAAPI_ASSOCIATE_TAG    # alderstaging-20
AMAZON_PAAPI_REGION           # us-east-1
CRON_SECRET                   # random, Vercel uses for cron auth
CATALOG_OBSERVE_ONLY          # "true" for weeks 1-2, "false" thereafter
BLOB_READ_WRITE_TOKEN         # Vercel Blob write token
NEXT_PUBLIC_BASE_URL          # https://read.alderprojects.com
```

---

## 3. Files already written — use them

Six files have been produced and are committed (or ready to commit) on the `read-v1` branch. Do not rewrite them. Read them carefully and build on top.

| Path | What it is |
|------|------------|
| `prisma/schema.prisma` | Full data graph, 18 tables. State-keyed. Event-log-backed. RoomSnapshots immutable. Headline derived field is `ValuationDelta`. |
| `lib/vision/extract.ts` | Claude vision extraction worker. Tier 2 (room confirmation, era, visible features). Tier 3 fields reserved but not populated. `PROMPT_VERSION = "v1.0.0"`. |
| `lib/vision/eval.ts` | Prompt evaluation harness. Runs against `test-photos/<roomtype>/*.jpg`, outputs HTML report with pass criteria. |
| `lib/catalog/refresh.ts` | Amazon PA-API catalog price refresh cron. Twice daily. Observe-only mode default. Email digest via Resend. |
| `app/api/cron/catalog-refresh/route.ts` | Next.js cron handler, bearer-auth via `CRON_SECRET`. |
| `vercel.json` | Cron schedule (catalog refresh 2x/day, user data sync, outcome capture, valuation delta). |

**Key invariants from those files — do not violate:**

- The `EventLog` is append-only. Every signal-emitting action writes an event. The relational tables are projections.
- `RoomSnapshot` is immutable. New capture = new RoomSnapshot row. The delta between snapshots is the outcome signal.
- The vision extractor never identifies products by brand and never flags defects. Those are Tier 3, deferred to v7.5+.
- `condition_note_short` from vision extraction is factual observation only. No value judgments ("dated", "outdated", "needs work"). The eval harness flags violations.
- `valuation_delta` is computed nightly via cron, not stored eagerly. The pipeline runs even before the model is accurate — the trajectory of data is what compounds.
- Catalog universe stays in source code (`src/content/smart-cart/universe.ts`) for weeks 1-12. Decision to migrate to DB (`CatalogProduct` table) happens at week 13 based on drift volume observed.

---

## 4. The 4-week plan

Each week has a hard ship target. Slipping a week means slipping launch.

### Week 1 — Foundation on staging

**Engineering deliverables:**

1. **Infrastructure provisioned.** Neon DB live, staging Vercel project deployed, `read.alderprojects.com` resolves, all env vars set, Prisma migration applied successfully against staging DB.
2. **Auth working.** Magic-link sign-in via Resend at `read.alderprojects.com/account/sign-in`. Session cookie set on verify. `/account` shows the signed-in user's email.
3. **Photo storage proven.** Test endpoint accepts a photo upload, strips EXIF via `sharp`, computes perceptual hash, writes to Vercel Blob, returns signed URL. End-to-end test passes.
4. **Vision eval passing.** Run `lib/vision/eval.ts` against 30+ test photos from the user (their home, friends' homes, varied room types). Iterate on the prompt until pass criteria met:
   - Room-type accuracy ≥95%
   - Era estimate within one decade on ≥80%
   - Zero value judgments in `condition_note_short`
   - High-confidence (≥0.7) on ≥70% of clear photos
5. **Catalog cron live in observe mode.** Twice-daily cron firing against staging Associate tag. First email digest arrives. Snapshots accumulating in `CatalogPriceSnapshot`.

**Files to create in week 1:**

- `lib/auth/magic-link.ts` — Resend-backed magic-link generation, token hashing, expiry, redemption
- `lib/auth/session.ts` — session token mint, cookie set/clear, `getCurrentUser()` helper
- `app/account/sign-in/page.tsx` — email-input form, posts to `/api/auth/magic-link/request`
- `app/account/sign-in/verify/[token]/page.tsx` — verify token, mint session, redirect to `/account`
- `app/account/page.tsx` — signed-in user dashboard skeleton ("Signed in as you@email.com")
- `app/api/auth/magic-link/request/route.ts` — POST, sends magic link email
- `app/api/auth/magic-link/verify/route.ts` — POST or GET, verifies and signs in
- `lib/photos/upload.ts` — EXIF strip via sharp, perceptual hash, blob upload, returns metadata
- `app/api/photos/test-upload/route.ts` — protected route for testing the upload pipeline before week 2's real UI
- `test-photos/<roomtype>/<filename>.jpg` — populated by the user with real photos for eval
- `.env.local.example` — documents all required env vars

### Week 2 — Vision live, synthesis rewires

**Engineering deliverables:**

1. **Photo upload UI in Smart Cart modal.** When the staging Smart Cart curation modal opens, a "Add photos of your kitchen" section appears. Drag-drop, mobile camera capture, max 8 photos per room, max 5 rooms. Each upload creates a `Photo` row attached to a `RoomSnapshot`. Photos visible in the user's session immediately after upload.
2. **Vision extraction running in production.** Every `Photo` row created triggers a background vision extraction job (Vercel Cron with short interval, or Inngest, or a simple queue table polled every minute). Results land in `VisionExtraction` table. Confidence under 0.7 routes to manual review queue.
3. **Manual review queue.** `/admin/photo-review` page lists pending low-confidence extractions side-by-side with the photo. Admin can approve, correct (edit the JSON), or reject. Updates `VisionExtraction.reviewStatus`.
4. **Smart Cart synthesis rewire.** `buildSmartCartV2` accepts photo extractions as input signal. The universe is filtered by photo-derived booleans (`has_under_cabinet_lighting`, `cabinet_style_shaker`, `countertop_laminate`, etc.) — products only appear in the cart if the photo evidence supports them. Cart receipt prose references the photo signal: "Based on your kitchen photos, we focused on under-cabinet lighting and cabinet hardware — your existing shaker cabinets and stone counters are working hard already."
5. **Beta waitlist live at `read.alderprojects.com/waitlist`.** Email + zip + room of interest captured. Stores to `VisitorSession` with `firstSource: "waitlist"`.

**Files to create in week 2:**

- `components/photo-upload/PhotoUploadModal.tsx` — the React component
- `components/photo-upload/RoomPhotoGroup.tsx` — sub-component for one room's photos
- `app/api/photos/upload/route.ts` — production upload endpoint, creates Photo + RoomSnapshot
- `app/api/photos/extract/route.ts` — kicks off vision extraction (called by upload route or by cron)
- `lib/vision/queue.ts` — background extraction queue (simple Postgres-backed queue)
- `app/api/cron/vision-extract/route.ts` — cron handler that polls the queue and runs extractions
- `app/admin/photo-review/page.tsx` — admin review queue UI
- `app/api/admin/photo-review/[id]/route.ts` — approve/correct/reject endpoints
- `lib/smart-cart/build-v2.ts` — updated synthesis that reads photo features (extends existing builder)
- `lib/smart-cart/photo-feature-join.ts` — joins photo extractions to universe tags
- `app/waitlist/page.tsx` — waitlist form
- `app/api/waitlist/route.ts` — waitlist submission handler

### Week 3 — SEO surfaces, pricing A/B, instrumentation

**Engineering deliverables:**

1. **`/zestimate-gap-checker` live.** Six-question form (year built, last renovation year, sqft, basic condition self-report, three room photos). Output: dollar-range gap estimate. Email-gated for the full PDF report.
2. **`/kitchen-renovation-estimate-from-photo` live.** Single photo upload, vision extraction, $/sqft estimate band, Smart Cart CTA with scope-variant pre-selected based on photo.
3. **`/pre-listing-photo-audit-vermont` live.** Pre-Alder Read product at $49 launch price. Photos required. Output is a one-page "before you list" PDF.
4. **Pricing A/B framework.** Three-cohort assignment at first Smart Cart impression, stored in `SmartCart.priceCohort`. Stratified randomization on traffic source and topic. Event log captures every assignment and conversion.
5. **Telemetry dashboard at `/admin/metrics`.** Photo upload rate, cart conversion by cohort, revenue per buyer by cohort, vision extraction confidence distribution, catalog drift summary.

**Files to create in week 3:**

- `app/zestimate-gap-checker/page.tsx` + supporting components
- `app/api/zestimate-gap-checker/compute/route.ts` — gap estimation logic
- `app/kitchen-renovation-estimate-from-photo/page.tsx`
- `app/api/kitchen-estimate/route.ts`
- `app/pre-listing-photo-audit-vermont/page.tsx`
- `app/api/pre-listing-audit/route.ts`
- `lib/pricing/cohort-assign.ts` — stratified randomization, deterministic by visitor ID
- `lib/pricing/cohort-experiment.ts` — cohort config and rollout rules
- `app/admin/metrics/page.tsx` — telemetry dashboard
- `lib/metrics/queries.ts` — SQL helpers for dashboard data
- `lib/pdf/pre-listing-report.ts` — generate the audit PDF (use pdfkit or similar)

### Week 4 — Outcome loop, merge, deploy, flag ramp

**Engineering deliverables:**

1. **Outcome capture pipeline.** +60-day after-photo email goes out via Resend (cron). When user uploads after-photos, new `RoomSnapshot` row with `captureContext: "outcome"` and `Outcome` row created. Email links to a magic-link URL that signs them in and lands them on `/account/projects/[id]/outcome`.
2. **ValuationDelta nightly recompute.** Cron walks every Property with new RoomSnapshots since last delta, recomputes baseline + adjusted estimate, writes new delta row. Model is rough at first — accuracy improves as data accumulates.
3. **Hardening pass.** Load test photo upload at 100 concurrent. Bug-bash magic-link, claim flow, consent modal, photo upload, vision extraction, manual review, Smart Cart synthesis, pricing cohort assignment.
4. **Feature flags wired.** Every new Read v1 surface gated by a flag, all flags off by default. Flags: `READ_V1_AUTH`, `READ_V1_PHOTOS`, `READ_V1_VISION`, `READ_V1_SYNTHESIS`, `READ_V1_PRICING_AB`, `READ_V1_SEO_TOOLS`, `READ_V1_OUTCOME`.
5. **Merge to main, deploy, ramp.** Single PR with the entire `read-v1` diff. Migration runs on prod DB once. Flags ramp over days 28-35.

**Files to create in week 4:**

- `app/api/cron/outcome-capture/route.ts` — sends +60d emails, opens outcome upload flow
- `app/account/projects/[id]/outcome/page.tsx` — after-photo upload UI
- `app/api/cron/valuation-delta/route.ts` — nightly delta recompute
- `lib/valuation/compute-delta.ts` — the delta model itself (start simple, iterate)
- `lib/feature-flags/flags.ts` — flag config and `isEnabled(flagName, userId?)` helper
- `lib/feature-flags/middleware.ts` — middleware that gates routes by flag
- `RELEASE-7-3-1.md` — release notes for the merge PR
- `MIGRATION-RUNBOOK.md` — step-by-step merge-day runbook (backup DB, run migration, verify, flag ramp)

---

## 5. Hard rules during the build

1. **Never push to `main`.** Every commit goes to `read-v1`. If a prod hotfix is needed on `main`, do it and immediately rebase `read-v1` on top.
2. **Rebase `read-v1` on `main` every morning.** Catches any prod hotfix within 24 hours. Resolve conflicts daily, not at merge time.
3. **Daily prod → staging data sync.** Cron runs at 2 AM ET, copies anonymized Smart Cart purchases, leads, and contractor prospects from prod to staging. Synthesis tests against real-shaped data.
4. **No partial features in `read-v1`.** If something isn't complete by end of its week, it does not get half-shipped. Either complete it or cut it from Read v1 scope.
5. **Test on staging end-to-end before any week ends.** End of every week, walk through every flow at `read.alderprojects.com` as a real user. Document any bug. Fix or cut.
6. **Vision prompt is the product.** Any change to `lib/vision/extract.ts` `SYSTEM_PROMPT` requires re-running the eval harness with the same test set. Don't ship synthesis changes if the eval regresses.
7. **Catalog stays in observe-only mode until end of week 2.** Do not flip `CATALOG_OBSERVE_ONLY=false` until two weeks of drift data have been observed and storage strategy decided.
8. **PII never leaves prod.** Anonymize emails (hash), nullify phones, replace names with placeholders on the prod→staging sync.
9. **Feature flags default off at merge time.** The day-28 deploy ships all code with zero behavior change to buyers. Ramp via flags over days 29-35.

---

## 6. Test photo collection for the vision eval

The user needs to gather **30-50 real photos** before week 1 ends. They go into `test-photos/<roomtype>/<filename>.jpg` on the local machine where the eval is run.

Recommended distribution:
- 8-10 kitchens (varied eras: 1980s, 2000s, 2020s; varied conditions)
- 5-7 bathrooms (varied vanity styles, shower types)
- 4-5 decks or patios (varied materials: pressure-treated, composite, ipe)
- 3-4 living rooms
- 3-4 bedrooms
- 2-3 basements (finished and unfinished)
- 2-3 mudrooms or laundry
- 2-3 exterior shots (front and back)
- 2-3 ambiguous edge cases (a kitchen-dining transition, a basement-with-bedroom, etc.)

Photos should come from the user's own home, friends' homes who consented, or staged real-estate listings (acceptable for testing purposes — the eval is internal). Avoid stock photos from Pinterest or Unsplash; they're too clean and don't represent real homes.

---

## 7. Marketing parallel track (engineering supports it)

Engineering ships a fully working preview at `read.alderprojects.com` from week 2 onward. The staging URL doubles as the public marketing surface — press, beta testers, journalists all use it. This means:

- **Week 1:** No public marketing. Engineering finishes infrastructure quietly.
- **Week 2:** Beta waitlist opens. URL: `read.alderprojects.com/waitlist`. Engineering must keep this URL stable through merge day.
- **Week 3:** SEO surfaces (`/zestimate-gap-checker` etc.) go live on staging. Pinterest and Reddit content drives traffic to staging URLs.
- **Week 4:** Press embargo lifts. Engineering ensures `read.alderprojects.com` is rock-solid by Tuesday of week 4 — that's when external press visits.

**The cutover at merge:** On day 28, the URLs migrate from `read.alderprojects.com/X` to `alderprojects.com/X`. Set up 301 redirects from staging URLs to prod URLs the moment the merge ships. Any link a journalist or beta tester has saved should still work.

---

## 8. Success gates

At end of each week, before starting the next, verify:

**Week 1 gates:**
- [ ] `read.alderprojects.com` is live and loads the homepage
- [ ] Prisma migration applied cleanly, all 18 tables present in staging DB
- [ ] Magic-link sign-in works end-to-end (email arrives, link signs you in)
- [ ] Photo upload test endpoint accepts a file, returns blob URL
- [ ] Vision eval harness passes all four pass criteria on 30+ test photos
- [ ] Catalog cron has run at least 4 times (2 days × 2 runs), email digests received

**Week 2 gates:**
- [ ] Smart Cart on staging shows photo upload UI when curation modal opens
- [ ] Uploading a photo creates Photo + RoomSnapshot + queues VisionExtraction
- [ ] Vision extraction runs within 60s of upload, writes to DB
- [ ] Cart receipt prose references photo signal when photos present
- [ ] `/admin/photo-review` lists pending extractions and accepts admin actions
- [ ] Waitlist captures 50+ signups (target — driven by Reddit + LinkedIn seed posts)

**Week 3 gates:**
- [ ] All three SEO surfaces live and functional on staging
- [ ] Pricing cohort assignment deterministic and stratified (verify with test traffic)
- [ ] `/admin/metrics` dashboard shows real numbers from staging activity
- [ ] At least 200 waitlist signups

**Week 4 gates:**
- [ ] Outcome capture cron sends test email successfully
- [ ] ValuationDelta computed for at least 10 properties in staging
- [ ] All feature flags wired and default-off in code
- [ ] Merge PR drafted with complete description
- [ ] DB backup taken
- [ ] Migration dry-run on Neon branch of prod DB passes

**Launch gates (days 28-35):**
- [ ] Day 28: merge clean, deploy clean, prod homepage unchanged
- [ ] Day 30: auth flag on globally, no errors
- [ ] Day 31: photo + vision flags on for 10% of cart traffic, healthy metrics
- [ ] Day 33: synthesis + pricing flags on for 100%, this is the launch
- [ ] Day 34: press embargo lifts, ProductHunt launch

---

## 9. When you need a decision the user must make

Some choices require user input. Don't guess. Use a clearly labeled question and wait for the answer. Examples:

- Pricing cohort copy ("Free with photos" vs "Free Smart Cart, requires photos")
- Email digest send time (currently 6 AM and 6 PM ET — confirm or change)
- Feature flag default for `READ_V1_AUTH` on day 28 (off vs internal-only)
- Press list final cuts

Otherwise, build. The plan is detailed enough that almost every decision has an answer in this prompt or in the six committed files.

---

## 10. Working style

- **Commit small, commit often.** Every working sub-feature gets a commit on `read-v1`. The PR description aggregates them.
- **Use the existing patterns.** The codebase has conventions for routes, components, data files. Match them. Don't refactor existing code unless required for Read v1.
- **Write the schema migration once.** No iterative migrations on staging — squash any changes into one `read-v1-foundation` migration before merge. Prod sees one migration on day 28.
- **Test on real photos, not synthetic.** The vision eval is gated on real photo distribution. Friends-and-family photos beat any stock library.
- **Talk to the user daily.** End-of-day status: what shipped, what's blocked, what decision is needed tomorrow. Don't go silent for days.
- **Read the schema before any new model.** `prisma/schema.prisma` is the source of truth for the data graph. Every new relation must justify why it can't fit into existing tables.

---

## 11. The first prompt to run after reading this

When the user signals "start", execute exactly this:

1. Confirm you've read this brief and the six committed files (`prisma/schema.prisma`, `lib/vision/extract.ts`, `lib/vision/eval.ts`, `lib/catalog/refresh.ts`, `app/api/cron/catalog-refresh/route.ts`, `vercel.json`).
2. List the env vars that need to be set on the new staging Vercel project.
3. Walk through the day-1 hour-by-hour setup (repo branch, Neon DB, Vercel project, env vars, DNS, migration).
4. Generate the first batch of week-1 files: `lib/auth/magic-link.ts`, `lib/auth/session.ts`, the auth pages, and the test photo upload endpoint.
5. Ask the user one question: "Once the staging Vercel project is provisioned and the env vars are set, do you want me to proceed with the magic-link auth implementation, or do you want to verify the catalog cron is working first?"

Then wait. Do not write any more files until the user answers.

---

## 12. Closing principle

This is not a feature release. It's a foundation for a $30M-$150M acquisition asset. Every decision compounds for three years. The boring infrastructure choices (event log immutability, schema state-keying, prompt versioning, observe-only catalog mode) are what protect the asset at exit diligence.

Move fast. But move with the long horizon in mind.
