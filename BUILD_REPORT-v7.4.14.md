# Morning report — v7.4.14 Site Refresh

Run: 2026-07-28 overnight, unattended. Branch `v7.4.14-site-refresh`, 3 commits
off `main`. **Items 1, 3, 4, 5, 7, 8 complete and verified. Item 2 (the Real
Example) is built and live-verified, but not from the session the spec named —
that session does not exist. Not deployed.**

`BUILD_REPORT.md` (v7.4.9/7.4.10) and `BUILD_REPORT-v7.4.13.md` are left
intact; this is versioned alongside them.

---

## §0.3 finding: the door session does not exist

The spec's centrepiece is a real-session render of "the July 28 real-photo run,
door read — the IMG_8250 entry," with a Cabot Australian Timber Oil BUY, a
door-assessment WAIT, and a photo showing a rust band, caulk line, and
threshold.

- `alder-real-photo-run.json` is **not in the repo** (`/docs` or anywhere else).
- No `IMG_8250` reference exists in the codebase.
- Production contains **zero** recommendations matching Cabot (0), rust (0), or
  timber oil (0).

Production has two reports, both from the same `visitorAnonId`, the first
claimed by `et65907@gmail.com` — your own test runs:

| report | date | photos | content |
|---|---|---|---|
| `cms30jjc…` | 2026-07-27 | 1 | bathroom read — 6 recs, no BUY |
| `cms5bnzpi…` | 2026-07-29 | 2 | attic bedroom — **BUY** draft-sealing $30–50, **WAIT** blinds, 3× Monitor |

**What I did.** Built §1.2's machinery exactly as specified — cached server-side
loader, standard result-card components, structural CR2 fallback, CTA event —
and pointed it at the most recent report that actually carries a BUY/WAIT pair,
rather than hardcoding a missing id. It selects by shape, so if the intended
session is imported later it will be picked up automatically as the most recent
qualifying report. The section now renders, verbatim from production:

> **A REAL CHECK, VERBATIM**
> **BUY** — Seal drafts around the bedroom sliding door/window
> *What we saw:* Visible gap and light around the sliding glass door/window frame junction · Baseboard pulling away from the wall near the same area
> Typical cost: $30–$50 · Cost basis: Windowdressers Vs Indow Vs DIY Window Inserts Vermont, verified May 2026
> **WAIT** — Replacing the dated bedroom blinds can wait

**What I did NOT do: ship a photo.** §1.2's crop instruction — lower two-thirds
of the door, glass and reflections excluded — is a privacy decision you pre-made
for a specific image. It does not transfer. The session that exists is an attic
*bedroom*, and its BUY is literally about light visible around a glass slider,
so the evidence *is* the glass perimeter the crop was meant to remove. Cropping
a photo of your bedroom for the homepage is not a call I should make on your
behalf overnight. The section ships cards-only and reads correctly without it.

**This is the one thing needing your decision.** Options: import the real door
session; approve a crop of the existing slider photo; or leave it cards-only.

## What shipped

| § | Item | State |
|---|---|---|
| 1.1 | Refund canon + sitewide swap | done |
| 1.2 | Real Example section | done, no photo (above) |
| 1.3 | Lane canon, four chips | done |
| 1.4 | Hero subhead / CTA / badges | done |
| 1.5 | Seasonal chip gating + July set | done |
| 1.6 | Vermont reframe + beta env slot | done |
| 1.7 | Worth-It definition + signal | done |

`src/lib/copy/canon.ts` is now the single source for refund policy, lanes,
CTAs, hero copy, footer tagline, and the beta badge. `constants.ts` re-exports
from it rather than defining a competing pair.

### The refund contradiction was not only marketing copy

The 24-hour claim lived in **transactional email** — `renderSmartCartReceiptBody`
and the delivery body both told paying customers "Need a refund? Within 24 hours
of purchase," while every marketing surface said 30 days. Both now interpolate
`REFUND_WINDOW_DAYS`.

Worth stating plainly: this **widens the refund promise made to customers at the
point of sale**, from 24 hours to 30 days. That is the direction §1.1 asked for
and it favours the customer, but it is a policy change, not a copy tweak. The
`/api/refund` route does not enforce a window in code — the comment that said
24 hours was stale documentation, now corrected.

### The lane rename is display-only, deliberately

`INVESTIGATE` is a live verdict in the engine enum, in `LANE_ORDER`, in
`validate.ts`/`verdicts.ts`, and **persisted on four production
`Recommendation` rows**. §1.8 forbids engine changes, so rewriting the enum was
not an option — and would have orphaned stored data. `canon.ts` keeps `id:
'INVESTIGATE'` and maps it to the label `Monitor`; `laneLabel()` is the only
translation point.

This makes §2's "grep `Investigate` → zero hits" a **scoped** assert: zero
reader-facing lane usages, with the uppercase enum allowed. The test encodes
exactly that distinction.

One colour note: the spec says the lanes are green/gray/amber/blue, but SKIP's
established result-card colour is a muted terracotta (`#8a3d2e`), not gray.
`canon.ts` carries the **established** values so the homepage and result page
match — which is what §2 actually checks. Changing SKIP to gray would be a
visual change to the result page, outside a copy release. Flag if you want it.

## Two bugs found and fixed while verifying

1. **The CR2 kill switch never worked.** `REAL_EXAMPLE_DISABLED` was checked
   *inside* `unstable_cache`, so it was only consulted on a cache miss — with a
   warm one-hour cache the fallback never engaged, and my first fallback test
   silently passed the real content through. Moved in front of the cache. The
   same class of bug would have applied to any emergency switch on that section.
2. **"Free, no account required" was still above the fold**, in the CheckCta
   drop zone, which the desktop screenshot showed sitting directly under the
   CTA. My first test wrongly excluded that file as "below the fold." Prose
   removed; the badge row is now the only instance; the test no longer excludes
   it.

## Verification

`npm run copy:test` → **38/38 pass**. `npx tsc --noEmit` → **0 errors**.

Live against the dev server:

- **Real path:** section renders `A real Check, verbatim` + the production BUY;
  `Real output` (the old false label) appears **0** times.
- **Fallback path** (`REAL_EXAMPLE_DISABLED=1`): heading `Example Check` = 1;
  `A real Check, verbatim` = 0; `Unedited output from a real session` = 0;
  production data leaked = **0**. CR2 holds in both directions.
- **Hero:** four chips (Buy/Wait/Skip/Monitor) with connectors; protected
  headline unchanged; badge row `Free · No account · Costs verified & dated`.
- **`/smart-cart` in July:** Memorial Day 0, Opening the house 0, Deck & outdoor 1,
  `Winterizing — early bird` 1, Mudroom & entry 1, Worth-It definition 1,
  30-day refund line 1.
- **Seasonal unit tests** at mocked May 20 / Jul 28 / Dec 1, including
  new-year-wrapping windows.
- **CR4 protected copy:** hero headline, "Why $19.99?", and "one sentence helps
  a lot" all assert present verbatim.

**Not verified:** no prod deploy, so no prod screenshots and no live
`ASSESSMENT_INTEREST` EventLog row (the handler is wired and the funnel
endpoint returns 200 locally, but the SQL check needs real traffic). Below-the-
fold screenshots came back blank — the Browser pane renderer stalled — so the
example section is evidenced by its extracted DOM text above rather than an
image. Lighthouse/CLS not measured; the section adds no image, so the CLS risk
the spec anticipated does not arise.

## Left undone

- **Guide-page refund strings.** ~20 guide `ctaBody` strings still hardcode
  "30-day refund". They are *consistent* with canon, so there is no live
  contradiction, but they are not yet importing the constant. Mechanical,
  touches 20 files, deliberately not bundled into a night with an unverified
  deploy.
- Deploy, prod screenshots, the click-through checkpoint, and the Resend email.

## Recommended next

1. Decide the example photo (import the door session / approve a crop / stay
   cards-only).
2. Deploy and run the prod checkpoint.
3. Sweep the guide `ctaBody` strings onto `REFUND_POLICY_SHORT`.
