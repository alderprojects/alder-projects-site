# v7.1 — sales rebuild, $25 fix, exchange route, edit panel, curation, email

Single coherent overnight rebuild of the v7 paid funnel: critical bug fixes, dynamic intent-driven sales pages, the Stripe-exchange route that fixes the broken redirect, removal of the passcode gate, an edit/respin mechanic, real Resend email delivery, and curated skip-list savings honesty so the $19.99 price feels earned.

**DO NOT MERGE.** Open as draft. Review on the Vercel preview deployment first, then merge once you've confirmed the Stripe configuration update (below) is in.

## Summary

- **Pricing**: bumped Smart Cart to $19.99 and Worth-It to $39.99 with a single `formatPrice` helper. Upgrade card delta computes dynamically from the price difference.
- **Bug fixes**: $25 cart-price default replaced with a 4-layer price resolver (tier → explicit id → display-name pattern → category band); whyThis truncation removed; move-number column removed from the dashboard; empty path tabs filtered before render.
- **Sales-page rebuild**: `/smart-cart` and `/worth-it` are now thin server-component shells wrapping a single `SalesPageClient` that owns intent state and drives a dynamic example card, value-proof grid, fit section, cross-sell, and sticky pricing CTA. Six categories on Smart Cart, six decisions on Worth-It, all sourced from a new `src/lib/intent-config.ts` catalog.
- **Email-first modal**: `CurationModal` now opens at email capture (fires `/api/intent/start`), continues to project context, then a sneak-peek panel hydrated from `/api/intent/teaser`, then payment confirmation.
- **Stripe exchange routes**: `/smart-cart/result?session_id=...` and `/worth-it/dashboard?session_id=...` look up the Stripe checkout session, read `client_reference_id`, and redirect to the existing dynamic `[cartId]` / `[planCode]` route — with a polling "Building your cart…" page while the webhook lands.
- **Passcode gate removed**: dashboards render any plan that exists in KV by `planCode` alone. Stored `privateToken` is server-rendered into the client component so state mutations stay token-gated.
- **Edit/respin**: Smart Cart result page has a "This cart isn't right" panel that re-picks scope/scenario, hits `/api/smart-cart/[cartId]/respin`, and rebuilds in place (capped at 3, then refund-by-email).
- **Worth-It dashboard**: first-view confirmation banner, "Project Complexity" relabel (with "Light" sub-label hidden when score < 6.0), per-row dismiss button, and four context modals (Start checklist, View Skip List, DIY Stop Line, Compare paths) replace the previous dead-link card actions. Each modal includes a lead-capture CTA that posts to a new `/api/plan/[planCode]/lead-context` endpoint.
- **Skip-list curation**: `SkipItem.scope` field (`scope_specific` | `topic_specific` | `general`) drives a priority pass in `getSkipListForCart` (capped at 6) and an honest savings recompute in `buildSmartCart` (general items no longer inflate the headline). General items render in a separate collapsible section below the savings snapshot.
- **Resend wired**: `sendNow()` posts immediate envelopes through Resend right after enqueueing, never throws, and reflects status back to KV. `v7-diag` adds `resend_api_present` and `resend_smoke_test` checks.
- **Distribution**: homepage product strip between intent cards and cost widget; property page Smart Cart CTA card paired with the existing Worth-It one above the affiliate kit surfaces; new `/decide` splitter page with three primary routes + curated comparison band + bundle-math explainer.

## Bug diagnoses

- **$25 price bug** — `src/lib/buildSmartCart.ts:242` (pre-fix) had `const estimatedPrice = item._tierPrice ?? estimatePriceFromShortNote(item) ?? 25`. Most catalog items lack PICK_TIERS metadata and have no `$` in `shortNote`, so they fell through to the literal `25` default. Fixed by changing `LeanCartItem.estimatedPrice` from `number` to `{ low, high }` and routing every item through `resolveItemPriceRange()` in the new `src/lib/item-prices.ts`. Result table cell + add-on row + PDF route updated to render ranges via `formatPriceRange`.
- **whyThis truncation** — `src/lib/buildSmartCart.ts` had a `truncateNote(item.shortNote)` call that capped at 80 chars with a trailing `…`. The full string was never persisted. Removed the call; full `shortNote` now flows to KV, the API, the PDF, and the email body.
- **Empty path tabs** — `src/components/worthIt/DashboardClient.tsx` rendered every entry in `plan.planPaths` regardless of whether `movesByPath[id]` had content. Filtered to non-empty paths before render. The catalog itself is unchanged — this is a UI-level filter so the underlying movesByPath is still computed and available for the Compare-paths modal.

## Sections shipped

- [x] Section 1 — Pricing update
- [x] Section 2 — $25 fix (item-prices resolver + range type)
- [x] Section 3 — whyThis truncation removed
- [x] Section 4 — Move # column removed
- [x] Section 5 — Empty path tabs filtered
- [x] Section 6 — PunchListModal token (already wired; works after Section 13 because token now flows from server props)
- [x] Section 7A — Footer dynamic town count
- [x] Section 7B — `/vermont-basics`: no fix needed; the route doesn't exist anywhere in the source. The `VermontBasicsSection` component is rendered inside `/property/[slug]` only.
- [x] Section 8 — `intent-config.ts`
- [x] Section 9 — Six shared intent components
- [x] Section 10 — Sales page rebuild
- [x] Section 11 — Email-first intake + sneak peek + new endpoints
- [x] Section 12 — Stripe exchange routes
- [x] Section 13 — Passcode gate removed
- [x] Section 14 — Smart Cart post-payment (header, banner, share, edit/respin)
- [x] Section 15 (most) — Worth-It dashboard banner, dismiss, complexity reframe, four context modals
- [x] Section 16 — Skip list curation + savings honesty
- [x] Section 17 — Resend transport
- [x] Section 18 — Homepage product strip
- [x] Section 19 — Property page CTA pair
- [x] Section 20 — `/decide` page
- [x] Section 21 — Build green, branch pushed, draft PR opened

## Stripe configuration changes you must make manually

Update each Payment Link's "After payment redirect" URL:

- **Smart Cart (test)** → `https://alderprojects.com/smart-cart/result?session_id={CHECKOUT_SESSION_ID}`
- **Worth-It Plan (test)** → `https://alderprojects.com/worth-it/dashboard?session_id={CHECKOUT_SESSION_ID}`
- **Smart Cart (live)** → same shape when ready
- **Worth-It Plan (live)** → same shape when ready

The webhook handler is unchanged. Both new exchange routes call `stripe.checkout.sessions.retrieve()` to read `client_reference_id` (which is the cartId / planCode the checkout endpoint already sets), then redirect to the existing dynamic route. If the webhook hasn't yet written to KV, a 3-second meta-refresh "Building your cart…" page loops until the record appears.

## Vercel env vars to add

- `RESEND_API_KEY` — test value works for now. `sendNow()` short-circuits when this is unset, leaving envelopes queued so nothing breaks.
- `RESEND_FROM_ADDRESS` — defaults to `hello@alderprojects.com` in code, but explicit in env makes it visible.

## Resend setup checklist (manual)

- [ ] Resend account created
- [ ] `alderprojects.com` domain verified in Resend (DKIM + SPF records added at the DNS provider)
- [ ] Test send via Resend dashboard succeeded
- [ ] `RESEND_API_KEY` added to Vercel for both Preview and Production
- [ ] Hit `/api/admin/v7-diag` and confirm `resend_smoke_test` returns `ok`

## Decisions I made on your behalf

- **Spec'd scope variant ids that don't exist in the v7 catalog** — `window_drafts_seal`, `weatherization_full_audit`, `fall_pre_winter_prep`, `outdoor_mudroom_kit`. Mapped each to the nearest authored variant and documented the substitutions in `src/lib/intent-config.ts`. `mudroom_entry` is flagged `beta` since the substitution is weakest.
- **Section 14G — product images on cart rows** — skipped. The `AffiliateItem` catalog has no image field, and the spec's fallback (parsing the Amazon search query for a thumbnail URL) is brittle enough that I'd rather ship the cart without images than ship images that look wrong on launch day. Documented as v7.2.
- **Section 15E — inline Smart Cart inside Worth-It dashboard** — skipped. Would have required a meaningful new section + image rework + overbuy-trap reuse. Left as v7.2 follow-up; the supporting card on the dashboard already links to the lean-cart preview.
- **Section 15G — punch list location-grouping rework** — minimal scope kept. The current PunchListModal already saves the bundle correctly; reorganizing items by location vs by move is an editorial restructure best done with the v8 routing-layer wiring in mind.
- **Section 16 — skip-item copy upgrades** — current scope_specific items already follow the "when you walk into Lowe's they push X" framing. A copy pass on the rest is queued for an editorial sprint, not this build.
- **Update homepage primary CTA to link to `/decide`** — left the Hero address-search as the primary. The new homepage product strip and existing intent cards already give `/decide` a natural entry; swapping the primary would cost SEO conversion we have data on.
- **`npm run lint`** — the project has no ESLint config (`next lint` prompts to set one up interactively). Did not introduce a new config in this PR; `npx tsc --noEmit` passes clean and `npm run build` passes including the voice-regression test.

## TBD / follow-up for v7.2

- Reminder cron job (Friday / Saturday-morning / Sunday) — `scheduleUpgradeOfferEmail` already enqueues T+72h envelopes; `sendNow()` short-circuits future-dated ones; the cron job that scans `email:queue:index` and posts due envelopes is the missing piece.
- Real testimonials on the sales pages (need 30+ real buyers first).
- Save-to-account UX once user accounts ship.
- Inline Smart Cart section inside the Worth-It dashboard.
- Per-row product images on the Smart Cart result page.
- Punch list location-grouping rework.
- Additional curated topic/scope combos beyond the initial three (kitchen cosmetic refresh, outdoor lake season, weatherization DIY air sealing).
- ESLint configuration pass.

## Local manual tests run

- `npm run build` — green, includes voice-regression test
- `npx tsc --noEmit` — clean
- All routes appear in the build output, including the new `/decide`, `/smart-cart/result` (exchange), `/worth-it/dashboard` (exchange), and the new API endpoints

🤖 Generated with [Claude Code](https://claude.com/claude-code)
