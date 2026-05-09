# v7.2.6 — Merge backlog reconciliation + cleanup

No new product features. This release reconciles the v7.2.1 through
v7.2.5 branch backlog into main, fills the mudroom gap from v7.2.5,
fixes a single editorial price-bound issue inherited from v7.2.4, and
clears infrastructure flags from prior releases.

## What's now live on production

- Smart Cart V2 framework (from v7.2.1)
- Modal hotfix + scope-variant ordering + cart debug endpoint (from v7.2.2)
- Hybrid universe + scope-catalog architecture (from v7.2.3)
- 4 v7.2.4 catalogs: kitchen_organizers, kitchen_cosmetic_refresh,
  kitchen_cabinet_hardware_swap, outdoor_lake_season
- Schema migration: routeOutRules, costBenefitClaim, vermontReasoning,
  executionLane, urgencyWindow, bundleWith (from v7.2.5)
- 9 new v7.2.5 catalogs: outdoor_freeze_prevention,
  outdoor_seasonal_opening, outdoor_deck_refresh, universal_owner_kit,
  home_moisture_control, home_water_quality, outdoor_dock_lake,
  home_safety_kit, universal_project_prep
- mudroom_entry_reset (from v7.2.6 cleanup)
- Universe: 222 products
- 14 v2-curated catalogs across 5 topics (kitchen, outdoor, mudroom,
  home_repair, universal)
- tsx as dev dependency for ingest-catalog.ts native runs (landed
  during v7.2.5)
- Resend production email config verified

## What's NOT in v7.2.6 (intentionally deferred to v7.3)

- Result page UI surfacing the v7.2.5 schema fields (route-out cards,
  urgency banners, costBenefitClaim per slot, vermontReasoning per
  slot, nextBestGaps, bundlePrompts)
- Property graph completion (v7.2.7 in original plan, moved to v7.3)
- Photo upload as input signal (v7.2.8 → v7.3)
- User accounts / persistent profile
- Worth-It Plan unpause (still paused)
- Alder Read product (deferred until photos prove value)
- imageUrl population across universe products — the result page
  is currently a wall of text. Surfaced as a v7.3 task spawned from
  the v7.2.6 smoke test.

## Plan-vs-reality deltas worth noting

- **EXPECTED_STATS "fix" was a no-op.** v7.2.5 already had exactly 13
  catalog entries with mudroom only mentioned in a comment; no
  preemptive 14-entry row to remove.
- **tsx dev dep was already added.** v7.2.5's paste 2 commit
  (`d1c29e75`) added it during the ingestion-tool upgrade. Step 7's
  separate PR was redundant.
- **PR retargeting + local rebases were required.** PRs shipped as
  stacked drafts (#2 → v7.1, #3 → v7.2.2, #4 → v7.2.3, #5 → v7.2.4),
  not main. Each was retargeted to main and rebased locally
  (`git rebase origin/main`) so duplicate patch-IDs got auto-skipped
  before `gh pr merge --rebase` would accept them. No content
  conflicts at any step — just SHA divergence from each upstream
  rebase-merge.
- **Single hard verify failure surfaced post-merge.** The
  hardware_swap_jig paper-template tier shipped from v7.2.4 with
  `priceLow: 0`, which the runtime verify endpoint rejected.
  Bumped to $1 with matching productSpec copy in PR #8.

## Verification

`/api/admin/v723-verify` reports `pass: true` post-fix:

```
{
  "pass": true,
  "universeSize": 222,
  "catalogCount": 14,
  "hardFailures": 0,
  "informationals": 3
}
```

The 3 remaining informationals are outdoor scopes
(`outdoor_lake_season`, `outdoor_deck_refresh`, `outdoor_dock_lake`)
that don't declare an `absentee_owner` scenario default. By design,
informationals are filtered out of the gate.

End-to-end smoke test of the v2 cart flow against production was
performed for kitchen_organizers / just_starting via real Stripe test
purchase: cart `CART-UPCNBN`, result page renders correctly with v1
layout (v2 layout surfacing comes in v7.3).

## PRs landed under the v7.2.6 banner

- [#2](https://github.com/alderprojects/alder-projects-site/pull/2) — v7.2.1 → main (Smart Cart V2 framework + kitchen_organizers + Worth-It pause)
- [#6](https://github.com/alderprojects/alder-projects-site/pull/6) — v7.2.2 → main (modal hotfix + scope-variant ordering + cart debug endpoint)
- [#3](https://github.com/alderprojects/alder-projects-site/pull/3) — v7.2.3 → main (hybrid universe + scope-catalog refactor)
- [#4](https://github.com/alderprojects/alder-projects-site/pull/4) — v7.2.4 → main (3 chat-ingested catalogs + ingestion script)
- [#5](https://github.com/alderprojects/alder-projects-site/pull/5) — v7.2.5 → main (9 catalogs + schema migration)
- [#7](https://github.com/alderprojects/alder-projects-site/pull/7) — v7.2.6-mudroom-ingest (paste 3 mudroom catalog)
- [#8](https://github.com/alderprojects/alder-projects-site/pull/8) — v7.2.6-verify-priceLow-fix (verify gate goes green)

## Known carryforward backlog

- Real product image URLs across universe (imageUrl field
  schema-ready since v7.2.3, not yet populated). **High priority.**
  Spawned as separate v7.3 task during v7.2.6 smoke test.
- Vermont contractor verification of moat claims to unlock stronger
  vermontReasoning copy
- CurationModal absentee_owner scenario as a visible option for
  outdoor scopes (currently passes through the
  data-curation-modal-scenario attribute but isn't a UI choice)
- Inline Smart Cart inside Worth-It dashboard (when Worth-It returns)
- Multi-agent loop infrastructure (v7.3+ freshness loop first)
- ESLint config wiring for non-interactive `npm run lint` (deferred
  from v7.2.6 step 10)

## Tag and ship

After all v7.2.6 work has confirmed `pass: true` on production:

```
git checkout main
git pull origin main
git tag v7.2.6
git push origin v7.2.6
```

This tags the merge-backlog reconciliation point. v7.3 branches from
v7.2.6.
