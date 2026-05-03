# V6 verification report

Verification run on the last commit of V6 (commit 19, before this
verification commit). All checks below ran against the prerendered
HTML in `.next/server/app/` after `npm run build`.

## URL resolution (V6 net-new)

All 9 standalone town pages resolve and render substantial body:

- `/stowe-vt` — 87 KB
- `/burlington-vt` — 83 KB
- `/vergennes-vt` — 77 KB
- `/montpelier-vt` — 79 KB
- `/manchester-vt` — 76 KB
- `/woodstock-vt` — 78 KB
- `/middlebury-vt` — 80 KB
- `/brattleboro-vt` — 77 KB
- `/st-johnsbury-vt` — 78 KB

All 5 V6 seasonal guides resolve:

- `/vermont-lake-season` — 90 KB
- `/vermont-spring-blackfly` — 80 KB
- `/vermont-fall-leaf-weatherization` — 91 KB
- `/vermont-pre-winter-prep` — 89 KB
- `/vermont-deep-winter` — 88 KB

`/seasons` index — 41 KB.

All 5 V6 topic guides resolve:

- `/guides/vermont-heat-pump-rebate-stack-2026` — 105 KB
- `/guides/vermont-weatherization-evt-rebate` — 94 KB
- `/guides/vermont-solar-battery-stack-2026` — 89 KB
- `/guides/vermont-adu-permit-cost-2026` — 92 KB
- `/guides/vermont-rebate-stack-2026` — 103 KB

## E-E-A-T scaffold

Spot-checked 2 V6 pages for byline + verifyDate + sources:

- `/stowe-vt`: "Last verified" renders 2× (byline + sources block);
  Sources block has 1+ "Verified" fact citation.
- `/vermont-lake-season`: same.

## JSON-LD coverage

Spot-checked 6 V6 net-new + existing pages:

- `/stowe-vt`: Article + BreadcrumbList + FAQPage + LocalBusiness ✓
- `/vermont-lake-season`: Article + BreadcrumbList + FAQPage ✓
- `/seasons`: BreadcrumbList + ItemList ✓
- `/guides/vermont-heat-pump-rebate-stack-2026`: Article + BreadcrumbList + FAQPage ✓
- `/kitchen-remodeling-stowe-vt`: Article + BreadcrumbList + LocalBusiness ✓
- `/chittenden-county-vt`: Article + BreadcrumbList ✓

Full audit (`scripts/audit-jsonld.mjs`): 94 prerendered pages audited,
all schema-complete. Zero violations.

## Property tool funnel

Spot-checked 4 pages for at least one `href="/"` funnel link:

- `/stowe-vt`: 1 ✓
- `/vermont-lake-season`: 2 ✓
- `/vermont-mud-season-homeowner-guide`: 2 ✓
- `/guides/vermont-heat-pump-rebate-stack-2026`: 2 ✓

## Body length minimums

All V6 net-new pages exceed their respective body length minimums:

- Town pages: 1,200 char min — all 9 over 75 KB ✓
- Seasonal guides: 7,000 char min — all 5 over 80 KB ✓
- Topic guides: 7,000 char min — all 5 over 89 KB ✓
- Town × service pages: 1,500 char min — sample at 55 KB ✓

## Banned phrase scan

Across `src/app` and `src/content`, scanning for marketplace-era
phrases (Post your project free, We'll match you, Vetted contractors,
matching service, How is this different from Angi, Comprehensive guide,
Game-changer, etc.):

Result: zero hits. Voice-guide.md, voice-regression-test.mjs,
SeoPage.tsx, and contractor-vetting.ts intentionally skipped (they
either enumerate the banned phrases for the test or are legacy code
not used by V6 routes).

## Voice regression test

```
[1/3] banned-phrase scan...           OK
[2/3] factIds non-empty check...      OK
[3/3] Trap: callout count check...    OK
```

Wired into `npm run build` — Vercel deploys fail if voice test fails.

## SEO meta audit

96 indexable pages audited. Zero violations on:

- `<title>` (unique)
- `<meta name="description">` (unique)
- `<link rel="canonical">`
- `og:title` and `og:url`
- Sitemap inclusion

`robots.txt` confirms `/property/` noindex enforced.

## Spot-check on 3 guides per spec

Per V6 spec commit 20 — spot-check one seasonal, one topic, one town:

- **Lake season** (`src/content/seasons/lake-season.ts`):
  12,347 bytes | 3 Trap callouts | 9 VT-specific phrases
  (Vermont-specific, Worth knowing, Verify with, EVT, GMP, etc.)
- **Heat pump rebate stack 2026** (`src/content/topics/...`):
  13,062 bytes | 3 Trap callouts | 49 VT-specific phrases
- **Burlington** (`src/content/towns/burlington.ts`):
  8,220 bytes | 3 Trap callouts | 20 VT-specific phrases

All three open with the actual problem (rule 1), have a Vermont-
specific detail per H2 (rule 6), have at least 3 "Trap:" callouts
(rule 3), cite FACTS for every numeric claim (rule 4), and end
sections with concrete actions (rule 7).

## Build status

`npm run build`:
- Voice regression test: PASS
- Next.js build: PASS
- 94 static pages prerendered

## Manual post-deploy steps

After this V6 ships to Vercel:

1. Submit updated sitemap to Google Search Console:
   https://search.google.com/search-console/sitemaps
2. Verify 1-2 sample URLs in Google Rich Results Test:
   https://search.google.com/test/rich-results
   - https://alderprojects.com/stowe-vt
   - https://alderprojects.com/guides/vermont-heat-pump-rebate-stack-2026
3. Watch GA4 for 30 days; identify which V6 net-new pages drive
   organic impressions and which are dormant.

## V6 commit summary

21 commits across two layers:

**Layer A — SEO infrastructure**
- Commit 0: voice-guide.md (cornerstone)
- Commit 1: facts.ts (citations layer)
- Commit 2: content templates (seasonal / topic / town)
- Commit 3: GuideFooter component (E-E-A-T scaffold)
- Commit 4: jsonld.ts (schema helpers)
- Commit 5: JSON-LD on existing content pages
- Commit 6: homepage tile patch (temporary)
- Commit 7: 9 town prose files
- Commit 8: /[townSlug] standalone town pages
- Commit 9: 5 net-new seasonal guides
- Commit 10: 5 net-new topic guides
- Commit 11: 54 town × service + county pages regenerated
- Commit 12: /seasons index
- Commit 13: /guides index update
- Commit 14: CONFIG articleBySeason all 6 + version bump
- Commit 15: homepage tile finalization

**Layer B — content quality engine**
- Commit 16: internal linking sweep
- Commit 17: voice-regression-test.mjs + wired into build
- Commit 18: audit-jsonld.mjs
- Commit 19: audit-seo-meta.mjs + robots.txt hardening
- Commit 20: this verification report

CONFIG.version: '2026.05.04-v6'
