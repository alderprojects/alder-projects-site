# V7 verification report

V7 ships the first paid revenue stream: Smart Cart ($19) and Worth-It
Plan ($39) with a $20 upgrade path between them. Built per the V7 spec
in 14 commits on top of V6.

CONFIG.version: `2026.05.04-v7`

## Build status

```
node scripts/voice-regression-test.mjs && next build

Voice regression: PASS
  [1/3] banned-phrase scan       OK
  [2/3] factIds non-empty check  OK
  [3/3] Trap: callout count      OK

Next.js build: PASS
  ✓ Compiled successfully
  ✓ Linting and checking validity of types
  ✓ Generating static pages (114/114)

tsc --noEmit: clean
```

## What V7 ships

### Two products, four screens

- `/smart-cart` (pre-sale) — "Buy this + this. Skip that."
- `/smart-cart/result/[cartId]` (post-sale) — numbered cart receipt,
  30-day TTL
- `/worth-it` (pre-sale) — "Know the best move. The move after that."
- `/worth-it/dashboard/[planCode]` (post-sale) — full saved dashboard

### Engine + content (V7 commits 1-12)

- `CONFIG.products.{smartCart, worthIt, upgrade}` — all prices, copy,
  refund windows, TTLs in one file
- `CONFIG.scenarios` — 5 brief scenarios (just_starting,
  already_have_basics, tight_budget, premium, lake_property)
- `CONFIG.shoppingTiming` — 15 category timing rules
- `src/content/scenarios.ts` — fully authored prose hooks per scenario
- `src/lib/scope-variants.ts` — 11 V7 scope variants. 4 fully authored
  for V7 (kitchen_cosmetic_refresh, kitchen_cabinet_hardware_swap,
  weatherization_diy_air_sealing, outdoor_lake_season). 7 ship
  structurally; V7.1 fills authored content.
- `src/content/skip-list.ts` — 38 skip entries, kitchen-heavy
- `src/content/overbuy-traps.ts` — 22 overbuy-trap entries powering
  the Savings Snapshot
- `src/content/moves.ts` — 40 ranked Worth-It Plan moves
- `src/content/diy-stop-conditions.ts` — 18 stop conditions
- `src/content/quantity-guidance.ts` — 30 per-item quantity rules
- `src/lib/pick-tiers.ts` — tight/mid/premium tiers for ~18 items
- `src/lib/buildAmazonUrl.ts` — centralized affiliate URL helper
- `src/content/traps.ts` (V6 catch-up) — 18 structured trap entries
  the V7 engine references by id

### Synthesis + storage (V7 commits 13-15)

- `src/lib/buildSmartCart.ts` — pure synthesis function. Property-
  INDEPENDENT. Returns full SmartCartOutput with lean cart, add-ons,
  skip list, savings snapshot, and overbuy-trap callout.
- `src/lib/buildWorthItPlan.ts` — pure synthesis function. Property-
  DEPENDENT when address provided. Generates plan code (TOWN-XXXX
  format), private token + SHA-256 hash, ranked moves by path,
  supporting cards, summary, Worth-It score tier.
- `src/lib/storage.ts` — Vercel KV-backed persistence. Smart Cart
  with 30-day TTL, Worth-It Plan with token-hash gating, email-
  recovery index, append-only event log, lead-intent table for V8.

### Stripe + email (V7 commits 19-22, 29, 34)

- `/api/smart-cart/checkout` — generates cart id, saves pending
  input, returns Stripe Payment Link URL with metadata
- `/api/worth-it/checkout` — same shape for Worth-It
- `/api/webhook/stripe` — signature-verified handler. Routes by
  metadata.product_type to buildSmartCart / buildWorthItPlan /
  upgrade flow. Throws on failure to trigger Stripe retry.
- `src/lib/email.ts` — KV-backed email queue. Five envelope types:
  smart_cart_receipt, worth_it_delivery, upgrade_offer (T+72h),
  upgrade_complete, reminder. Decoupled from transport.
- `/api/upgrade/smart-cart-to-worth-it` — GET (link) + POST (fetch).
  Validates Smart Cart unexpired, redirects to upgrade Stripe link
  with from_cart_id metadata.
- `/api/refund` — admin-gated Stripe refund. 24-hour window for
  Smart Cart, 7-day window for Worth-It Plan.

### UI (V7 commits 16-18, 23-30, 31-32)

- `components/smartCart/SmartCartPreSaleHero.tsx`
- `components/CurationModal.tsx` — 2-step modal opens via
  `[data-curation-modal-open]` buttons site-wide
- `components/worthIt/{WorthItPreSaleHero, DashboardClient,
  PunchListModal, ProjectGrewModal, FindPlanForm}.tsx`
- Smart Cart result page renders the four-quadrant mockup post-sale
  layout: numbered sections, Print/Download, Overbuy Trap callout,
  Upgrade card
- Worth-It dashboard renders the post-sale mockup: dark green nav,
  plan identity row with three identity cards (Plan Code / Private
  Link / Share Plan), three path cards, Highest-Payoff Moves table
  with 5 path tabs and add-to-plan toggles, supporting cards row,
  Plan Summary bar, action bar with reminder checkboxes
- `components/property/{WorthItCTACard, SmartCartTextLink}.tsx` —
  property page CTAs respecting V4 engagement gate + V5 refund-risk
  suppression
- `components/SmartCartGuideFooterCta.tsx` — homepage compact CTA
  + reusable footer CTA (per-guide wiring deferred to V7.1)

### Plan-mutation endpoints (V7 commits 25-30)

- PATCH `/api/plan/[planCode]/state` — token-gated PlanState updates
- POST `/api/plan/[planCode]/punch-list` — saves bundle, writes
  lead_intent (handyman_bundle, score 70)
- POST `/api/plan/[planCode]/project-grew` — writes lead_intent
  (project_grew, score 90), enqueues internal alert email
- GET `/api/plan/[planCode]/pdf` — server-rendered HTML; browser
  Save-as-PDF for V7. @react-pdf/renderer in V7.1.
- `/worth-it/find` + `/api/plan/find` — privacy-safe email recovery

### Analytics (V7 commit 33)

19 GA4 events appended to `lib/analytics.ts` covering Smart Cart
funnel (7), Worth-It funnel (10), and upgrade (2). Existing event
pattern, snake_case parameters.

## Required environment variables

Set these in the Vercel project before live launch:

```
KV_REST_API_URL                    (auto-injected by Vercel KV)
KV_REST_API_TOKEN                  (auto-injected by Vercel KV)
STRIPE_SECRET_KEY                  (Stripe dashboard → API keys)
STRIPE_WEBHOOK_SECRET              (Stripe dashboard → Webhooks; user added)
STRIPE_PAYMENT_LINK_SMART_CART     ($19 Payment Link URL)
STRIPE_PAYMENT_LINK_WORTH_IT       ($39 Payment Link URL)
STRIPE_PAYMENT_LINK_UPGRADE        ($20 Payment Link URL)
ADMIN_REFUND_TOKEN                 (operator-chosen secret for /api/refund)
```

User confirmed the webhook + 3 price items (Smart Cart $19, Worth-It
Plan $39, Upgrade $20) are configured in the Stripe dashboard.

## Stripe webhook configuration

In the Stripe dashboard, register the endpoint:

- URL: `https://alderprojects.com/api/webhook/stripe`
- Events: `checkout.session.completed` (the only event V7 handles)
- Signing secret: copy to `STRIPE_WEBHOOK_SECRET` (user has done this)

The Payment Links must be configured to pass `client_reference_id`
through to Checkout Sessions. The checkout endpoints encode the
cartId / planCode in `client_reference_id`, and the webhook reads
that as the lookup key in KV pending state.

## Manual end-to-end test plan (post-deploy)

### Smart Cart flow
1. Visit `/smart-cart`
2. Click "Build My Smart Cart"
3. CurationModal: kitchen + cosmetic_refresh + just_starting
4. Email + Stripe test card 4242 4242 4242 4242
5. Redirect to `/smart-cart/result/CART-XXXXXX`
6. Receipt enqueued in `email:queue:*` (verify via Vercel KV browser
   or admin script)
7. URL works for 30 days; expired URL shows rebuy CTA
8. Print + Download buttons trigger window.print
9. Upgrade button → `/api/upgrade/...` → Stripe → Worth-It Plan
10. Upgrade-offer email queued at T+72h (verify via KV)

### Worth-It flow
1. Visit `/worth-it`
2. Click "Get My Worth-It Plan"
3. CurationModal: kitchen + cosmetic_refresh + just_starting +
   address (Stowe)
4. Stripe test card
5. Redirect to `/worth-it/dashboard/STOWE-XXXX?token=...`
6. Delivery email enqueued (KV)
7. Path tab switching works (client-side)
8. Add to plan toggles → PATCH state (verify in KV)
9. Reminder checkboxes → PATCH state (verify in KV)
10. Bundle Small Fixes modal opens, save → lead_intent in KV
11. Project Grew modal opens, submit → lead_intent + alert email
12. Share copies link to clipboard
13. Download PDF opens print-ready HTML
14. Find My Plan flow: `/worth-it/find` → email → recovery email
    enqueued

### Refund flow
1. Smart Cart purchase, request refund within 24 hr via
   `/api/refund` with admin token
2. Verify Stripe refund created, KV cart marked refunded, cart URL
   shows refunded notice
3. Same pattern for Worth-It Plan within 7 days

### Mobile sanity (390px viewport)
- All four screens render without overflow
- Tap targets 44×44 px minimum
- Stripe Checkout responsive (Stripe handles)

## Voice rubric pass

V6 voice-regression-test.mjs runs as part of `npm run build` and
gates Vercel deploys. V7 content was authored to the same rubric:

- Banned phrases: zero hits across V7 content modules
- "Trap:" callouts: present where expected (in scenarios.ts and
  skip-list reasoning blocks)
- FACTS citations: numeric claims in V7 content reference FACTS ids
  via the same `relatedFactIds` pattern V6 uses

## Deferred to V7.1 (after V7 launch + 7-14 days)

- Full authored content for the 7 scope variants flagged
  `smartCartReady: false` (kitchen_organizers, kitchen_lighting_swap,
  kitchen_faucet_swap, weatherization_attic_basics, outdoor_deck_refresh,
  heat_pump_readiness_prep, bath_accessibility_basics)
- Premium tier on the remaining items in `pick-tiers.ts`
- Per-seasonal-guide and per-topic-guide footer CTA placements (the
  reusable `SmartCartGuideFooterCta` component is ready)
- @react-pdf/renderer-driven PDF generation (current PDF endpoint
  serves print-ready HTML)
- Behavioral upgrade triggers in addition to inline + 72hr email
- State-aware reminders in addition to day-of-week
- Customer-facing refund flow (admin-only ships at V7 launch)
- Vercel Cron job that drains the email queue via the chosen
  transport (Gmail / Postmark / Resend)
- Real testimonials once first 30 buyers have lived with their
  carts (no fabricated testimonials shipped)

## Lead intent capture (V8 bridge)

The `leadintents` KV list captures every Bundle Small Fixes
submission and every Project Grew submission with full plan context:

```ts
{
  id, planCode, leadType, trigger, tasksJson,
  location: { town, town_tier },
  intentScore,             // 70 for handyman_bundle, 90 for project_grew
  status: 'new',
  createdAt
}
```

V8 (handyman + contractor routing, ~6 months out) consumes this
list. Capturing the signal at V7 launch even though routing is not
built means the data is already there.

## V7 commit log

```
f3f184d  feat(v7-stripe): admin-gated refund endpoint
89134a7  feat(v7-engine): analytics events for Smart Cart + Worth-It funnels
33e4319  feat(v7-cta): property page + homepage CTA placements
4b479ec  feat(v7-plan): Worth-It Plan UI + plan endpoints
536ef99  feat(v7-cart): Smart Cart UI + checkout + webhook + email queue
95d8ddd  feat(v7-engine): storage.ts — Vercel KV-backed persistence
e93010b  feat(v7-engine): buildWorthItPlan synthesis function
4935fd8  feat(v7-engine): buildSmartCart synthesis function
ec5c166  feat(v7-content): diy-stop-conditions + buildAmazonUrl + pick-tiers + quantity-guidance
6ca5270  feat(v7-content): moves.ts — 40 ranked Worth-It Plan moves
031a09d  feat(v7-content): overbuy-traps.ts — Savings Snapshot data
ce7f2e4  feat(v7-content): skip-list.ts — 38 Smart Cart skip entries
3c79300  feat(v7-engine): scope-variants.ts — 11 V7 scope variants
52572e1  feat(v7-content): scenarios.ts — 5 scenario content layers
6882ac8  feat(v7-engine): CONFIG.products + scenarios + shoppingTiming
da74719  feat(v6-catchup): TRAPS table + scripts/v6-audit.mjs
```
