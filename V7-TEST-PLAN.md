# V7 pre-launch test plan

Three diagnostic endpoints + a Stripe-test-mode end-to-end walkthrough.
Run all three before opening live traffic.

All admin endpoints share a single auth: `ADMIN_REFUND_TOKEN`. Set this
once in Vercel env vars to a secret you control. Send as either:

```
Authorization: Bearer <token>
?adminToken=<token>            (query string)
```

Pass `<deploy-host>` below stands for `https://alderprojects.com` (prod)
or your Vercel preview URL while you test.

---

## Step 1 — Confirm the wiring

```
GET <deploy-host>/api/admin/v7-diag?adminToken=<TOKEN>
```

Checks every dependency V7 needs:

- All required env vars present (KV, Stripe keys, Payment Links, admin token)
- Stripe API reachable with the configured secret
- Vercel KV write + read round-trip
- Payment Links resolve to `buy.stripe.com`
- CONFIG.products enabled flags
- Stripe mode (test vs live) — surfaced explicitly so you do not run
  live cards by accident

The response body is JSON with `summary.overall` of `green`, `yellow`,
or `red`. The `masked_env` block shows the prefix + last 4 of each
secret so you can sanity-check the right value is loaded without
echoing it.

**Expected before going live:** `summary.overall = "green"` and
`stripe_mode = TEST` while you run Step 3.

---

## Step 2 — Preview a synthesis without paying

```
GET <deploy-host>/api/admin/v7-preview?adminToken=<TOKEN>
    &product=smart_cart
    &topic=kitchen
    &scope=kitchen_cosmetic_refresh
    &scenario=just_starting
```

Returns the JSON `buildSmartCart()` would have stored after a real
purchase. Eyeball:

- `leanCart.items` — 4-6 items, each with quantity, price, why-this
- `addOns` — 2-3 add-on items
- `skipForNow` — non-empty list of skip entries
- `savings` — `potentialSavingsLow / High` is non-zero
- `overbuyTrapCallout` — items list reads like real overbuy traps

For Worth-It:

```
GET <deploy-host>/api/admin/v7-preview?adminToken=<TOKEN>
    &product=worth_it
    &topic=heat_pump
    &scope=heat_pump_readiness_prep
    &scenario=already_have_basics
    &address=1920+Lake+Dunmore+Rd,+Salisbury,+VT
```

Verify:

- `bestPath` has a sensible title
- `movesByPath.best_overall` returns 4-6 ranked moves
- `whatToBuy.length > 0`, `thisSaturday.length > 0`
- `summary` has reasonable spend / time / score values
- `townName` parsed from address (Salisbury), `townTier` set
- Plan code format `TOWN-XXXX` (e.g. `PROJ-8K4P` or town abbrev)

This pass exercises every content module (scenarios, scope-variants,
moves, skip-list, overbuy-traps, quantity-guidance, pick-tiers) without
any Stripe activity.

---

## Step 3 — End-to-end purchase in Stripe test mode

Set `STRIPE_SECRET_KEY` to a `sk_test_…` key for this. Step 1's diag
will say `stripe_mode = TEST` when you are safe.

### 3a. Smart Cart

1. Open `<deploy-host>/smart-cart`
2. Click **Build My Smart Cart**
3. CurationModal:
   - Topic = Kitchen
   - Scope = Cosmetic refresh
   - Scenario = Just starting
   - Email = something you can read
4. Stripe Checkout: card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
5. Click **Pay**
6. You should land on `<deploy-host>/smart-cart/result/CART-XXXXXX`
7. Verify the page renders sections 1-4, the savings snapshot, and the
   upgrade card
8. Verify the receipt envelope was enqueued:

```
GET <deploy-host>/api/admin/email-queue?adminToken=<TOKEN>&type=smart_cart_receipt
```

Should return one envelope with the cart id you just created and
`status = queued`.

### 3b. Worth-It Plan

1. Open `<deploy-host>/worth-it`
2. Click **Get My Worth-It Plan**
3. CurationModal:
   - Topic = Heat pump
   - Scope = Heat pump readiness prep
   - Scenario = Already have basics
   - Address = `1920 Lake Dunmore Rd, Salisbury, VT`
   - Email = same as before
4. Stripe Checkout, test card 4242
5. You will not be redirected to the dashboard automatically — Stripe
   sends you to the success URL configured on the Payment Link. Use
   the magic link that should arrive via email queue:

```
GET <deploy-host>/api/admin/email-queue?adminToken=<TOKEN>&type=worth_it_delivery&body=1
```

Find the `body` field — it contains the magic link. Copy that URL,
paste into a browser. You should land on the dashboard with all five
path tabs and the Highest-Payoff Moves table populated.

### 3c. Dashboard interactions

While on the dashboard:

- Switch path tabs — moves re-render client-side
- Click **Add to plan** on a move — should toggle, with the change
  saved to KV via PATCH
- Toggle **Remind me Friday** — should save
- Click **Bundle Small Fixes** — modal opens, save creates a
  lead_intent
- Click **Project Grew?** — modal opens, submit creates a lead_intent
  + an internal alert email envelope
- Click **Share plan** — link copies, toast appears
- Click **Download PDF** — opens print-ready HTML

### 3d. Upgrade flow

1. Back on `/smart-cart/result/CART-XXXXXX`
2. Click **Upgrade Now — $20**
3. Should redirect to the upgrade Stripe Payment Link
4. Pay with test card 4242
5. Webhook fires, plan is built from the original cart's context, an
   upgrade-complete envelope queues. Verify:

```
GET <deploy-host>/api/admin/email-queue?adminToken=<TOKEN>&type=upgrade_complete&body=1
```

### 3e. Find My Plan

1. `<deploy-host>/worth-it/find`
2. Enter the email used at purchase
3. Submit — generic success message returns regardless of whether the
   email matched (privacy)
4. If the email had a plan, a recovery envelope is queued:

```
GET <deploy-host>/api/admin/email-queue?adminToken=<TOKEN>&type=find_plan_recovery&body=1
```

The body contains a passcode-recovery URL. Open it in an incognito
window — should land on the dashboard.

### 3f. Refund

```
POST <deploy-host>/api/refund
Authorization: Bearer <ADMIN_REFUND_TOKEN>
Content-Type: application/json

{
  "cartId": "CART-XXXXXX",
  "stripePaymentIntentId": "pi_..._copied_from_stripe_dashboard",
  "reason": "test refund"
}
```

Should return `ok: true` with the Stripe refund id. Reload the
result page — should now show the refunded notice.

Same shape for Worth-It Plan within 7 days, using `planCode` instead
of `cartId`.

---

## Step 4 — Switch to live keys

Once Step 3 passes end-to-end:

1. Replace `STRIPE_SECRET_KEY` with your `sk_live_…` key
2. Replace each `STRIPE_PAYMENT_LINK_*` with the live Payment Link URL
3. Re-deploy
4. Re-run Step 1 diag — should say `stripe_mode = LIVE`
5. Make one $19 purchase from your own card to confirm the live flow
   (refund yourself afterward via Step 3f or the Stripe dashboard)

---

## Common failure modes

| Symptom                                       | Likely cause                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Diag returns 401                              | `ADMIN_REFUND_TOKEN` not set or token mismatch                              |
| Diag `kv_roundtrip` = error                   | KV not bound to project, or env vars not redeployed                         |
| `Stripe API call failed`                      | Wrong key (e.g. publishable `pk_…` instead of secret `sk_…`)                |
| Payment Link warns                            | URL is not `buy.stripe.com/…` — wrong link copied                           |
| Webhook never fires after Stripe Checkout     | Webhook URL wrong, or `STRIPE_WEBHOOK_SECRET` not for the right webhook     |
| Result page shows 404                         | Webhook ran but cart synthesis threw — check Vercel logs                    |
| `pending Smart Cart` not found in webhook     | Pending TTL expired (30 min) — user spent too long in Stripe                |
| Dashboard shows passcode prompt               | Magic link token mismatch — re-derive from the email body                   |
| `email-queue` returns []                      | Webhook never reached the email-enqueue line — check earlier failure        |

---

## After launch

- The email queue accumulates envelopes but does not transmit at V7.
  Pick a transport (Gmail / Postmark / Resend) and ship the cron job
  that drains `email:queue:*` to mark `status = sent`. Until then,
  you can hand-send urgent items by reading the body field directly.
- Watch `/api/admin/email-queue?status=failed` daily for the first
  week.
- Watch the lead-intent KV list (V8 bridge) — these capture real
  user signal and should not be ignored.
