# Release v7.3.1 — Read v1 (foundation + expansion)

**Branch:** `read-v1`
**Target merge:** week 4 of the 4-week Read v1 build (NOT this release —
this release notes file documents the staging deploy)
**Status:** staging deploy complete, week-1 success gates pending

## What changed

This is the foundation release for Alder Read — a state-keyed,
event-log-backed data graph + photo intake pipeline + photo-aware Smart
Cart synthesis. Built on a parallel `read-v1` branch over 4 weeks, merged
behind feature flags.

**Production (`alderprojects.com`) is untouched. All changes live on
`read.alderprojects.com` until week 4.**

## What's in this branch (5 commits as of staging-deploy)

| Commit | Layer |
|---|---|
| `7f0d399` | Foundation: 18-table data graph schema, vision worker + eval harness, catalog refresh cron (observe-only), test-photos scaffold |
| `dd6a297` | Week-1 magic-link auth (Resend), session management, photo upload pipeline with EXIF strip + 64-bit aHash + Vercel Blob |
| `dbb1f06` | Expansion bundle: 5 new schema models, LLM-driven catalog expansion cron, 5 AM ET review digest with token-auth action page, GSC weekly sync with aiOverviewLikely inference, photo-as-content consent model |
| `56e34c0` | Standing brief + v1.1 patches into `docs/` for reference |
| `a4cf4c8` | TSC cleanup (SDK pin fixes), cron smoke-test script |

## Schema (23 tables total)

**Identity:** User, Session, MagicLink
**Households + properties:** Household, HouseholdMember, Property, PropertyProfile
**Rooms + photos (the moat):** Room, RoomSnapshot (immutable), Photo, VisionExtraction
**Valuation:** ValuationDelta (Zillow-primary derived field)
**Projects + leads (Angi-secondary):** Project, SmartCart, LeadIntent, Contractor, ContractorAcceptance, Outcome
**Telemetry:** EventLog (append-only), Consent, VisitorSession
**Catalog refresh:** CatalogProduct, CatalogPriceSnapshot
**Expansion + review:** CatalogExpansionCandidate, RecommendationChange, ReviewActionToken
**Feedback loop:** GscPageStats
**Public content consent:** PhotoContentUse

Migration: `npx prisma migrate dev --name read-v1-foundation-and-expansion`

## Crons (5 total, all production-only on Vercel)

| Schedule (UTC) | Local ET | Cron | Purpose |
|---|---|---|---|
| `17 8,20 * * *` | 3:17 AM / 3:17 PM | catalog-refresh | Amazon PA-API price + availability refresh, observe-only mode |
| `47 8 * * *` | 3:47 AM daily | catalog-expand | LLM-driven scope expansion (3-5 candidates/scope/night, 10-scope rotation) |
| `0 10 * * *` | 5:00 AM daily | daily-digest | 5 AM review digest email with one-click action tokens |
| `17 9 * * 1` | 4:17 AM Mondays | gsc-sync | Search Console weekly pull + aiOverviewLikely inference (disabled by default until service account configured) |
| `* * * * *` | every minute | vision-extract | Photo extraction queue worker (week-1 stub returning `{skipped: true}`) |

All bearer-auth via `CRON_SECRET`. Each has a `DISABLE_*_CRON` env-var
kill switch for graceful disable without redeploy.

## Auth + photo pipeline

**Magic-link sign-in:**
- `/account/sign-in` — email entry form
- `/account/sign-in/verify/[token]` — consume + session mint + redirect
- 15-min one-shot tokens, SHA-256 hashed at rest
- Always returns 200 from `/api/auth/magic-link/request` (no email enumeration)

**Photo upload pipeline:**
- EXIF stripped via sharp.rotate() (orientation baked into pixels)
- HEIC → JPEG re-encoding (browsers don't render HEIC)
- 64-bit aHash (16 hex chars) for dedup, matches Photo.perceptualHash spec
- Content-addressed Vercel Blob keys (`photos/<userId>/<sha-prefix>.<ext>`)
- 12 MB cap, allowed mimes: jpeg/png/webp/heic/heif
- Test endpoint: `/api/photos/test-upload` (auth-gated, no DB writes)
- Production endpoint: `/api/photos/upload` lands week 2

## Brief patches now in effect

The v1.0 → v1.1 brief patches (in [docs/READ-V1-BRIEF-PATCH.md](docs/READ-V1-BRIEF-PATCH.md))
make three substantive changes to the standing instructions:

1. **Photos are a triple-purpose moat** — data signal, property graph,
   AND SEO content. 30%+ of the 25,000-photo target must carry public-
   content consent.
2. **Three new hard rules:** non-commodity content wins (per Google AI
   optimization guide), no fan-out content (per-town/per-trade variants
   are scaled-content abuse), photo `public_content_use` consent is
   first-class.
3. **Marketing posture pivot:** skip AEO/GEO hacks, invest in real-photo
   carousels on guides, one canonical page per intent (reverses
   v7.2.x contractor-vertical fan-out strategy).

## Known-stubbed items (intentional, per bundle README)

These are documented "human-work-after-merge" items:

- `loadUniverseForTopic` in `src/lib/catalog/expand.ts` returns `[]` —
  LLM gets thin context until wired to `src/content/smart-cart/scopes/`.
  First catalog-expand runs will produce less-specific candidates.
- `loadUniverse` in `src/lib/catalog/refresh.ts` returns `[]` —
  refresh runs are no-ops until wired to `src/content/smart-cart/universe.ts`.

## Singleton fix — applied to all DB-touching modules

The expansion bundle shipped each module with its own `new PrismaClient()`.
That pattern exhausts Neon's connection pool under HMR + serverless cold
starts. All modules now import from `src/lib/db.ts` (the singleton from
the week-1 commit). Files refactored: `expand.ts`, `digest.ts`,
`feedback.ts`, the admin action page, and the pre-existing `refresh.ts`.

## SDK pin fixes

Three errors in the bundle code that `tsc --noEmit` caught (would have
500'd on first cron hit):

1. **`extract.ts`** — Anthropic SDK 0.30.1 only supports `type: 'base64'`
   image sources. Added `resolveImageSource` helper that fetches blob URLs
   and base64-encodes them on-demand.
2. **`upload.ts`** — `@vercel/blob` 0.27.3 has no `allowOverwrite` option.
   Replaced with try/catch on "already exists" for the content-addressed
   dedup case.
3. **`page.tsx`** — `FormData.entries()` iteration needed `Array.from()`.

## How to deploy (see MIGRATION-RUNBOOK.md)

Full 10-step runbook in [MIGRATION-RUNBOOK.md](MIGRATION-RUNBOOK.md).

## How to smoke-test after deploy

```bash
BASE_URL=https://read.alderprojects.com \
CRON_SECRET="<your secret>" \
./scripts/test-crons.sh
```

Exits 0 if all 5 crons + auth check pass.

## What's NOT in this release (week 2-4 work)

- Photo upload UI in Smart Cart modal (week 2)
- Vision extraction queue worker (week 2 — replaces the stub)
- `/admin/photo-review` listing page (week 2)
- Smart Cart synthesis rewire to read photo features (week 2)
- Beta waitlist `/waitlist` (week 2)
- `/zestimate-gap-checker`, `/kitchen-renovation-estimate-from-photo`,
  `/pre-listing-photo-audit-vermont` (week 3)
- Pricing A/B framework (week 3)
- `/admin/metrics` dashboard (week 3)
- +60d outcome capture cron (week 4)
- ValuationDelta nightly recompute (week 4)
- Feature flags + merge to main (week 4)

## Co-authored

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
