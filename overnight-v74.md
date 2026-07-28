Alder Projects — OVERNIGHT AUTONOMOUS RUN (v7.4 finish + deploy)

You are running unattended overnight in auto mode. Nobody will answer questions: never ask, never wait for input, never stop to confirm. When a decision is needed, make the call that best serves the standing product rules below, record it in the run report, and keep moving. If a phase is blocked, mark it BLOCKED with the reason in the report and continue to the next phase. The only full-stop conditions are listed at the bottom.

REPO CONTEXT (verified 2026-07-26, do not re-derive)
- Repo: /Users/evanturner/Claude Work/alder-projects-site (github alderprojects/alder-projects-site)
- Branch: v7.4.0-recommendation-engine, pushed, open as PR #45. main deploys production-direct to alderprojects.com via Vercel (Hobby plan).
- Built and verified so far (v7.4.0–v7.4.2c): recommendation engine (src/lib/recommend/*), dataset (data/vermont-costs.json, 83 items), additive migration ALREADY APPLIED to the Neon DB (all 9 migrations applied — do not run migrate dev, never reset), routes /api/photos/recommend|answer|delete, /api/report/unlock|feedback|latest|cart/checkout, report_cart branch in the Stripe webhook, drip on daily-digest cron, homepage `/` (Alder Projects brand home) + `/check` (Alder Check page) with QR handoff (reuses v7.3.3 HandoffToken; redeem allowlists ?to=check), SEO copy pass + inline-SVG creatives. tsc and next build are clean at HEAD.
- Vision prompt is at open-v1.2.0 (added optional `privacy` detection object). Standing rule: prompt changes require an eval re-run before deploy — Phase 2 satisfies this.
- test-photos/ directories exist but are EMPTY. The "5 founder fixture photos" from the v7.4.4 spec are NOT in the repo. Handle per Phase 1/2 instructions; do not invent them.

STANDING PRODUCT RULES (non-negotiable, enforced in code already — do not weaken)
1. Brand "Alder Check" in UI/meta/OG/JSON-LD/email copy ONLY. Internal routes/schemas/types stay report/recommendation.
2. Single-pass analysis, layered disclosure: free/email/paid tiers over ONE persisted analysis. SKUs are exclusively paid-surface. Free-tier commerce = category-search affiliate links on BUY recs only.
3. Every report ≥1 SKIP or WAIT (validate.ts). LLM output never carries numbers; dataset only. Safety categories route to INVESTIGATE. No person/household inference. Rebates >120 days old render "check current program".
4. Upsell only when ≥1 BUY. Zero-BUY reports get save/re-check framing, never a cart offer.
5. Vercel Hobby: production-direct, no new cron entries (piggyback existing daily crons), synchronous pipelines within maxDuration budgets.
6. Env var rule when adding prod vars: `vercel env add NAME production --value "actual_value" --yes --no-sensitive`.

OPERATIONAL GOTCHAS (learned this session — respect them)
- NEVER run `next build` while the dev server is running: they share .next and corrupt each other. Stop the dev server, `rm -rf .next`, build, then restart dev if needed.
- Prisma CLI needs env loaded: `set -a && . ./.env.local && set +a` before npx prisma commands (DATABASE_URL + DIRECT_URL).
- The dev DB in .env.local is the live Neon DB. Additive schema changes only; any rows you create for testing must be cleaned up via the product's own delete endpoint (which also deletes blobs) — never raw DELETE sweeps.
- git identity warnings are cosmetic; commit style: imperative subject prefixed with version tag, body explains why, end with Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>.
- Repo merge convention: squash-merge with "(#NN)" suffix in the title (see git log).
- ANTHROPIC_API_KEY is NOT in .env.local; it IS in Vercel. Phase 0 pulls it.

════════════════════════════════════════════════════════════════════
PHASE 0 — Env bootstrap
════════════════════════════════════════════════════════════════════
KNOWN (verified 2026-07-26): Vercel CLI is authed and linked. ANTHROPIC_API_KEY in Vercel is a SENSITIVE (write-only) var — `env pull` returns the literal placeholder "[SENSITIVE]", so it can NEVER be pulled. Evan is adding the real key directly to .env.local.
1. `npx vercel env pull .env.vercel.local --environment=production --yes`, then merge the needed NON-sensitive keys into .env.local WITHOUT clobbering existing lines and SKIPPING any value that equals "[SENSITIVE]": BLOB_READ_WRITE_TOKEN, RESEND_API_KEY, KV_*, AMAZON_PAAPI_*, CRON_SECRET, STRIPE_PAYMENT_LINK_SMART_CART, NEXT_PUBLIC_BASE_URL. Never print secret values to the transcript; reference names only.
2. Verify ANTHROPIC_API_KEY in .env.local actually authenticates: one minimal messages.create against claude-opus-4-8 (print model/stop_reason/usage only). If it is missing or 401s: Phases 1–2 fall back to running the E2E flow against the branch's Vercel PREVIEW deployment URL (previews hold the sensitive key; find the URL via `npx vercel ls` or the PR checks — if the preview is auth-protected and unreachable, Phases 1–3 are BLOCKED; record and continue at Phase 4). Direct-API steps (vision eval) are SKIPPED in the fallback and flagged in the report.

════════════════════════════════════════════════════════════════════
PHASE 1 — Live end-to-end pipeline verification (the engine has never
processed a real photo)
════════════════════════════════════════════════════════════════════
1. Source 4 real interior photos using the PEXELS_API_KEY already in .env.local (search "living room interior", "old kitchen", "basement unfinished", and one photo of a room WITH a person visible). Save under test-photos/<room>/ with descriptive names. These are for PIPELINE verification; they are not the founder vision-quality fixtures.
2. Start the dev server (nohup npm run dev, wait for ready). Drive the real flow with curl or a node script (multipart, cookie jar for alder_anon_id):
   a. POST /api/photos/upload for 3 person-free photos (consents JSON per route docs) → collect snapshotIds. Assert extraction returns features.
   b. POST /api/photos/recommend {snapshotIds} → assert: ok, ≥1 SKIP/WAIT among all recs (query DB across tiers, not just the free response), exactly ≤2 free recs + locked stubs, no dollar signs in any summary/nextAction (numbers only in costLow/costHigh/rebate), no brand names in free text, tenureQuestion present, cart artifacts persisted in DB but ABSENT from the free-tier response.
   c. POST /api/photos/recommend/answer {tenure: rent} → assert verdict changes propagate (any rec leaving BUY marks its CartCandidates fitStatus=removed), status CHECK_REFINED.
   d. Upload the WITH-PERSON photo into a fresh set → recommend → assert it is excluded (excludedPhotoCount ≥1 or extraction privacy flag) OR record a PROMPT GAP finding if Haiku doesn't flag it — if the gate misses, strengthen the keyword fallback in src/lib/recommend/gate.ts rather than the vision prompt (prompt changes re-trigger the eval rule).
   e. POST /api/photos/recommend/delete → assert 200, photos+blobs gone.
   f. GET /api/report/latest → sanity.
3. Record timings (the recommend route must fit maxDuration 60 with margin; if the Opus call pushes total >45s, set RECOMMEND_MODEL=claude-sonnet-5 via env in Vercel AND document the tradeoff in the report — do NOT silently change the code default).
4. Fix any bug found, re-run until green. Commit fixes as v7.4.2d.

════════════════════════════════════════════════════════════════════
PHASE 2 — Eval harness (v7.4.4 part 1) — DEPLOY GATE
════════════════════════════════════════════════════════════════════
1. Build scripts/eval-photos.ts per the v7.4.4 spec: fixture-driven, asserts schema validity, verdict rules (≥1 SKIP/WAIT), person-photo exclusion, recency question on seasonal conflict, tenure fork, no fabricated numbers, no person-inference terms. Fixtures = a manifest JSON mapping photo paths → expected assertions, so the founder can drop his 5 labeled photos in later without code changes. Wire `npm run check:eval`.
2. Run it over the Phase 1 Pexels set with appropriate expectations (person photo → exclusion; obvious rooms → correct overall category; all → schema valid, honesty invariant).
3. Re-run the EXISTING vision eval (npm run vision:eval / scripts/eval-vision.ts) over the same photos to confirm prompt v1.2.0 didn't regress extraction shape (all parse, categories honest, privacy object present).
4. GATE: if 2 or 3 fail and you cannot fix without weakening a product rule, DO NOT DEPLOY. Mark Phase 3 BLOCKED, continue to Phase 4.
5. Record in the report: "Founder 5-fixture eval still pending — drop photos into test-photos/ per manifest and run npm run check:eval." This is an accepted gap, authorized for this deploy only because the v1.2.0 prompt change was additive and the synthetic eval covers the new behavior.

════════════════════════════════════════════════════════════════════
PHASE 3 — Deploy (authorized)
════════════════════════════════════════════════════════════════════
1. Ensure working tree committed+pushed; final clean `next build` (dev server stopped).
2. `gh pr merge 45 --squash --subject "v7.4.0-v7.4.2: Alder Check engine, homepage takeover, monetization, QR handoff (#45)"`.
3. Watch the Vercel production deployment to completion (vercel CLI or gh checks). If the build fails on Vercel: fix forward on a new branch, PR, squash-merge, redeploy. Never revert-force main.
4. Prod smoke: GET https://alderprojects.com/ and /check (200, new titles present), /photo-report → 308 → /check, sitemap intact. Run ONE full report on prod via the API flow from Phase 1 (small photo), verify it completes, then delete it via the delete endpoint. Do NOT test Stripe checkout with a real charge; verify only that /api/report/cart/checkout returns a checkoutUrl.
5. Record the live URL + deployment ID in the report.

════════════════════════════════════════════════════════════════════
PHASE 4 — v7.4.1c: guides become infrastructure
════════════════════════════════════════════════════════════════════
New branch v7.4.1c-verdict-hubs off main (post-merge; if Phase 3 blocked, off the feature branch).
1. `/check/[slug]` programmatic verdict pages: generate ~12 slugs from the category allowlist + dataset (heat-pump, bathroom-fan-upgrade, refrigerator-replacement, weather-stripping, leak-sensors, window-inserts, basement-dehumidifier, etc.). Each page: title in query shape ("Is a Heat Pump Worth It? Buy / Skip / Wait Verdict [2026]"), server-rendered standing verdict card (reuse VerdictCard + dataset numbers + citations), cost/rebate table, assumptions, FAQ block with FAQPage JSON-LD (citable standalone answers), the one-tap photo CTA (CheckCta), canonical to parent guide where one exists. Pages render FROM the dataset so they update when it does. Region-generic copy per v7.4.2b conventions ("Typical cost", Vermont as proof point).
2. Guide verdict boxes: server-rendered Buy/Skip/Wait box at the top of each guide that maps to a dataset category (standing verdict + cost range + rebate + photo CTA "Get your free Alder Check for YOUR home"). Implement as one component wired into the guide template — do not hand-edit 40 guide pages.
3. Citations already render on verdict cards; verify guide links resolve.
4. Sitemap: add /check and all /check/* with real lastmod; keep existing entries.
5. Repoint the v7.2.19 contractor-page banners: "Get a free photo report first — know what's worth doing before you call a contractor" → /check.
6. tsc + clean build + spot-render 3 hub pages in the dev server. Commit, push, PR, squash-merge (deploy gate: only if Phase 3 deployed successfully; otherwise leave the PR open).

════════════════════════════════════════════════════════════════════
PHASE 5 — v7.4.3: privacy hardening
════════════════════════════════════════════════════════════════════
Branch v7.4.3-privacy.
1. Blob privacy: new uploads switch to non-guessable keys + access controlled per @vercel/blob capabilities (if private blobs/signed URLs are not supported on the current SDK/plan, implement the equivalent: random 32-byte key suffix via addRandomSuffix + never expose blobUrl in any API response — document the choice). Photo reads go through a session-gated API route, not raw blob URLs.
2. Retention: PHOTO_RETENTION_DAYS env (default 90). Piggyback the existing anon-cleanup cron: delete blobs+Photo rows past retention for reports that are deleted or never completed; completed reports keep photos until retention or user deletion.
3. Deletion flow already deletes bytes — extend to also purge VisionExtraction rows (verify cascade) and add a GET endpoint for deletion-request status.
4. Privacy copy verification: the FAQ/report copy must match actual behavior after these changes ("excluded or redacted where possible" — we exclude; do not claim redaction until crop/redact ships; adjust copy if needed). Never claim non-storage.
5. tsc + build + E2E delete/retention test against dev server. Commit, push, PR (leave open for morning review — this one touches storage semantics; do NOT self-merge).

════════════════════════════════════════════════════════════════════
PHASE 6 — v7.4.4 part 2: drift digest + admin-lite
════════════════════════════════════════════════════════════════════
Branch v7.4.4-admin-lite.
1. Nightly confidence-drift digest: extend the existing daily-digest email (lib/email/digest.ts) with a report section — last 24h: reports created, verdict mix, mean confidenceScore per verdict, validation-adjustment counts (from pipelineLogJson), drip sends, eval-harness last run status. No new cron.
2. Admin-lite: one protected route (reuse existing admin auth pattern — find it under src/app/admin) listing recent Reports: verdict mix, confidence, feedback, flags (recencyFlagged, exclusions), links to raw pipelineLogJson, plus a disable toggle: `disabledAt` column on Recommendation via a NEW additive migration (generate with migrate diff like 20260726000000 did; apply with migrate deploy) — disabled recs render nowhere in wire.ts/disclosure.ts.
3. CategoryObservation count surface on the same admin page (v7.4.1c flywheel item).
4. tsc + build + smoke. Commit, push, PR (leave open, do not self-merge — schema change deserves morning eyes).

════════════════════════════════════════════════════════════════════
PHASE 7 — Run report (always, even if everything blocked)
════════════════════════════════════════════════════════════════════
Write OVERNIGHT-REPORT.md at repo root (untracked): per-phase status (DONE/BLOCKED/SKIPPED + why), live URL if deployed, every assumption and judgment call, bugs found+fixed in Phase 1, eval results table, timings, PRs opened with links, and a prioritized morning to-do list (top item: drop the 5 founder photos into test-photos/ and run npm run check:eval; second: review+merge the v7.4.3 and v7.4.4 PRs). Also post the summary as a comment on PR #45 via gh. End with memory update: update the project-v74-alder-check memory file with the new state.

STOP CONDITIONS (halt everything, write the report, do nothing further)
- Any evidence of acting on the wrong database or wrong Vercel project.
- Stripe: anything beyond read-only checks and checkoutUrl generation.
- A production incident you caused and cannot fix forward within 3 attempts (then: revert the specific commit via a revert PR, verify prod healthy, stop).
- Eval gate failure that would require weakening rules 1–4 to pass.

Budget discipline: prefer boring, verifiable increments; commit at every green checkpoint so nothing is lost; keep total Opus API spend for testing under ~30 report runs.
