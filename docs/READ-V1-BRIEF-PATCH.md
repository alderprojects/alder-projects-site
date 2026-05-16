# Read v1 Brief — Revision Notes (v1.1.0)

Updates to `docs/READ-V1-CODE-PROMPT.md` based on the Google AI optimization guide and the photos-as-content strategic insight.

Apply these patches to the existing brief.

---

## Patch 1 — Section 1 (Mission) third paragraph

**Find this block:**

> - Alder is becoming a data-asset business with a marketplace attached. The data graph is the moat.
> - Photos uploaded by homeowners are the structural moat that Zillow and Angi can't replicate. Zillow can't economically acquire interior walkthroughs at scale. Angi has lead form data only, not interior condition.
> - The 3-year exit narrative is acquisition by Zillow ($30M-$150M range) or Angi ($15M-$60M range), based on CFO valuation analysis. Schema design is **Zillow-primary** (headline derived field is `ValuationDelta`), Angi-secondary (`Project.lane` and `ContractorAcceptance` serve their pitch from the same primitives).
> - 30-day revenue goal: blended revenue per Smart Cart buyer goes from $19 baseline to $25+ via photo-aware synthesis and a three-cohort pricing A/B test (free-with-photo, $9.99-with-photo, $29-without-photo).
> - 12-month data goal: 25,000 photos in the graph across 5,000+ properties with full RoomSnapshot history.

**Replace with:**

> - Alder is becoming a data-asset business with a marketplace attached. The data graph is the moat.
> - **Photos uploaded by homeowners are a triple-purpose moat:**
>   - **Data signal** — photo-derived features make Smart Cart synthesis specific (not generic), driving conversion lift
>   - **Property data graph** — per-room interior condition snapshots feed the Zillow valuation pitch and the Angi routing pitch
>   - **SEO content moat** — real Vermont home photos with explicit consent are unique non-commodity content per Google's AI search guide; they cannot exist on any other site
> - The 3-year exit narrative is acquisition by Zillow ($30M-$150M range) or Angi ($15M-$60M range), based on CFO valuation analysis. Schema design is **Zillow-primary** (headline derived field is `ValuationDelta`), Angi-secondary (`Project.lane` and `ContractorAcceptance` serve their pitch from the same primitives), with photos-as-content as the SEO defensibility layer that compounds organic traffic.
> - 30-day revenue goal: blended revenue per Smart Cart buyer goes from $19 baseline to $25+ via photo-aware synthesis and a three-cohort pricing A/B test (free-with-photo, $9.99-with-photo, $29-without-photo).
> - 12-month data goal: 25,000 photos in the graph across 5,000+ properties with full RoomSnapshot history, of which 30%+ have consent for public SEO use.

---

## Patch 2 — Section 5 (Hard rules) add three new rules

**Insert at the end of the existing 9-rule list:**

> 10. **Per Google's AI optimization guide, non-commodity content wins.** All content created by the catalog-expand cron or human-authored expansions must carry an explicit "what makes this non-commodity" angle. Commodity content (recycled common knowledge, "7 tips for X") will rank progressively worse as Google's AI Overviews mature.
> 11. **No fan-out content.** Do not generate per-town, per-trade, or per-scenario variants of the same content. Google explicitly flags this as scaled content abuse. One canonical entry per gap.
> 12. **Photos with `public_content_use` consent are first-class content.** When opting users into photo upload, surface the granular consent options. Photos with `allowGuides: true` feed the guide page carousels. Photos with `allowOutcomes: true` feed the project outcome story flow. Never assume blanket consent; treat photo public use as a separate, higher-bar opt-in than personal recommendations.

---

## Patch 3 — Section 7 (Marketing parallel track) updates

**Find this block:**

> The right model: **marketing budget for every engineering milestone**. Each shipped layer is a launch moment, with a defined audience and a defined CTA. Here's the calendar.

**Insert immediately before that line:**

> **The Google AI optimization guide changes the marketing posture.** Per Google's own documentation, the most effective SEO investment is first-hand expert content with regional specificity. For Alder, this means:
>
> - **Don't lean on AEO/GEO "hacks."** Google explicitly says LLMs.txt files, "AI markup," chunking content, and rewriting for AI summarization don't help. Skip them.
> - **Photos are the moat.** A guide page with 6-8 real consented Vermont kitchen photos is structurally more valuable than the same guide with stock imagery. Every guide page revision over the next 12 months should add real-photo carousels where consent permits.
> - **Search Console feedback loop.** The GSC sync cron (weekly) writes `aiOverviewLikely` signals into `GscPageStats`. The daily digest surfaces which pages are winning AI summarization — the canary for "this content is non-commodity enough to survive."
> - **One canonical page per intent.** Don't fan out per-zip-code, per-trade variants. One excellent kitchen-refresh page beats 30 mediocre town-specific ones. This is a hard reversal from the v7.2.x contractor-vertical strategy and should be explicit in the next planning cycle.

---

## Patch 4 — Section 11 (First prompt) add two steps

**Find:**

> 5. Ask the user one question: "Once the staging Vercel project is provisioned and the env vars are set, do you want me to proceed with the magic-link auth implementation, or do you want to verify the catalog cron is working first?"

**Replace with:**

> 5. Ask the user one question: "Once the staging Vercel project is provisioned and the env vars are set, do you want me to proceed with the magic-link auth implementation, or do you want to verify the catalog cron is working first?"
>
> 6. Reinforce that all expansion candidates require human-supplied evidence before publish. The catalog-expand cron generates DRAFTS only. The 5 AM email digest is the canonical workflow for review — one-click approve/reject for safe items, tap-through evidence form for the high-value non-commodity ones.
>
> 7. When the user authors a guide page or content surface, default to including a photo carousel placeholder. Guide pages without real-photo carousels are leaving the SEO moat on the table.

---

## Patch 5 — Section 12 (Closing principle) add one paragraph

**Append to the existing closing principle:**

> The Google AI optimization guide makes the strategy concrete: Alder's competitive moat is content that cannot be commoditized. User-uploaded photos with consent, Vermont-specific data points, contractor-verified evidence, and outcome-validated case studies — these are the content forms that survive as AI Overviews summarize everything else into oblivion. Every catalog expansion decision, every guide page, every product recommendation should ask: "what is unique about this that no other site can produce?" If the answer is "nothing," the work doesn't ship.

---

## File reference updates

Add to the "Files already written" table in section 3 (after the existing 6 entries):

```
| `prisma/schema-expansion-patch.prisma`              | Adds CatalogExpansionCandidate, RecommendationChange, ReviewActionToken, GscPageStats, PhotoContentUse models |
| `lib/catalog/expand.ts`                             | LLM-driven expansion worker, Google-guide-aligned commodity-risk scoring |
| `lib/gsc/feedback.ts`                               | Search Console API integration, aiOverviewLikely inference |
| `lib/email/digest.ts`                               | Daily 5 AM ET review digest with one-click action buttons |
| `app/api/cron/catalog-expand/route.ts`              | Cron handler — nightly scope expansion |
| `app/api/cron/daily-digest/route.ts`                | Cron handler — 5 AM digest send |
| `app/api/cron/gsc-sync/route.ts`                    | Cron handler — weekly GSC pull |
| `app/admin/catalog-review/action/[token]/page.tsx`  | Token-based one-click action handler with evidence form |
```

---

## New environment variables

Add these to the env-var table in section 2:

```
DISABLE_CATALOG_EXPAND_CRON       # default false, kill switch for Job 2
DISABLE_GSC_CRON                  # default false, kill switch for GSC sync
DISABLE_DIGEST_EMAIL              # default false, kill switch for 5 AM digest
GSC_SERVICE_ACCOUNT_JSON          # full JSON contents of Google service account key
GSC_SITE_URL                      # default "https://alderprojects.com/"
```

Document that `GSC_SERVICE_ACCOUNT_JSON` requires one-time setup: create service account at Google Cloud Console, grant Search Console API access, add service account email to alderprojects.com property in search.google.com/search-console as a Property User with at least "restricted" access.

---

## Sequence change for week 1

Section 8 (Success gates) needs Week 1 gates updated to include catalog expansion. Add after the existing 6 Week-1 gates:

> - [ ] Catalog expansion cron has run at least once and produced 3+ draft candidates
> - [ ] First daily digest email arrived in `hello@alderprojects.com` inbox at 5 AM ET
> - [ ] One-click reject test: click a reject button from the email, verify the candidate moved to `rejected` status in DB
> - [ ] Tap-through evidence form test: click a "supply evidence" button, fill the form on mobile, submit, verify the candidate moved to `approved` status with evidenceSuppliedJson populated

---

## End of patches

The brief now has three explicit pillars where it had two:
1. **Data graph** for the acquisition narrative
2. **Smart Cart synthesis** for the 30-day revenue lever
3. **Photos as SEO content** for the organic-traffic compounding moat

All three feed the same underlying schema. All three are gated by the same consent layer. All three serve the same exit narrative.
