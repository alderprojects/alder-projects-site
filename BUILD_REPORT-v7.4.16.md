# Morning report — v7.4.16 Result Restructure

Run: 2026-07-29, unattended. Branch `v7.4.16-result-restructure`, 3 commits off
`v7.4.14-site-refresh` (the canon dependency in §0.3 is not on `main`).
**Logic layer complete and tested (63/63). The UI components and email
template are not built. Not deployed.**

Read the first section before anything else — it is a live customer-facing
bug in my own v7.4.14 work, not a v7.4.16 finding.

---

## I got the refund fix wrong in v7.4.14. It is fixed now.

v7.4.14's report said the refund contradiction was resolved. It was not.

`CONFIG.products.smartCart.refundWindowHours` was a hardcoded `24`,
**interpolated at runtime**. My v7.4.14 verification was a text grep for
`24 hour` / `24-hour`, which cannot see a number that only exists after
template interpolation. The test passed and the contradiction stayed live in
six surfaces:

| surface | rendered |
|---|---|
| `CurationModal.tsx:224` | "24-hour refund window" — **the purchase modal** |
| `PricingCTA.tsx:38` | "24-hour refund window" — **the pricing CTA** |
| `SmartCartCTACard.tsx:80` | "24-hour refund window · No subscription" |
| `SmartCartGuideFooterCta.tsx:62` | "24-hour refund window · No subscription" |
| `CartActions.tsx:150` | "we refund liberally inside the 24-hour window" |
| `email.ts:168` | photo-cart receipt: "24-hour refund window" |

And worse: **`/api/refund` enforces that bound.** Line 85 compares the cart's
age against `refundWindowHours` and returns 422 outside it. So a customer who
read "$19.99 · Full refund within 30 days, no questions asked" on the homepage
and asked on day 5 was **rejected by the refund tooling**. The comment I added
to that route in v7.4.14 — "This route does not enforce a window in code" —
was simply false.

**Fixed:** `canon.ts` gains `REFUND_WINDOW_HOURS = REFUND_WINDOW_DAYS * 24`;
`CONFIG` derives from it, so the enforced window is now 30 days and equals the
promised one by construction; the six display sites render the canon phrase.
The `canon-tests` suite now asserts the **derivation** rather than the prose,
so a runtime-interpolated window cannot pass a text grep again:

```
[PASS] REFUND_WINDOW_HOURS derives from the canonical days
[PASS] the Smart Cart config derives its window from the canon
[PASS] enforced window == promised window
[PASS] no component renders a window from refundWindowHours
```

`npm run copy:test` → 42/42.

## §0.2: the golden set does not exist, so the release gate cannot run

§2.1 is named the release gate: "re-run all 8 golden fixtures … any drift →
abort." There is no such set.

- Production has **2 reports** (Jul 27 bathroom, Jul 29 attic bedroom) — not
  "the 7 real July 28 sessions."
- There is no door session. Zero recommendations mention Cabot, rust, or deck
  boards. The founding anecdote — "deck boards BUY, door WAIT" — has no
  counterpart in the data.
- The eval harness (`test-photos/eval-manifest.json`) has **5 groups, 2
  enabled**, backed by **4 stock Pexels photos**. The three `founder-*` groups
  are `enabled: false` with their photos absent — the "founder 5-fixture eval"
  that has been an open item since v7.4.8.

This is the third consecutive pack whose premise assumes a data corpus that
isn't there. Worth deciding whether to build that corpus before specifying
against it again.

### What I did instead — and why it is stronger, not weaker

§1.2 was the one engine-adjacent change: a new `subject` field on the
synthesis output plus a prompt instruction. That is precisely the change most
likely to shift verdicts, which is why the spec gated it. With the gate
unrunnable, shipping it blind would be the one thing the spec forbids.

But §1.1 already specifies a fallback chain, and its second link needs no
model output at all: **`claimLinks[].signatures`**, which the pipeline already
emits as `feature_type:room:severity`. I verified they are fully populated on
both real reports. So grouping is derived from data that already exists.

The result: **no prompt change, no schema change, no pipeline change** — so
verdicts cannot drift. CR1 holds by construction rather than by test, and the
suite asserts it structurally via `git diff` against the base branch:

```
[PASS] synthesis prompt untouched      [PASS] validator untouched
[PASS] recommend pipeline untouched    [PASS] scoring untouched
[PASS] gate untouched                  [PASS] prisma schema untouched
[PASS] verdict rules untouched
```

Link 1 of the chain is implemented and grounding-checked, so §1.2 can be
switched on later without revisiting the file — once a golden set exists.

## What shipped

| File | Purpose |
|---|---|
| `src/lib/result/subjects.ts` | derivation, grouping, inventory chips |
| `src/lib/result/focus.ts` | deterministic "Start here" selector |
| `src/config/skipArbitrage.json` | Component B, 2 sourced entries |
| `src/lib/result/savings.ts` | CR2 estimator + render gate |
| `src/lib/copy/canon.ts` | both upsell variants, `MAX_UPSELLS_PER_RESULT` |
| `scripts/result/restructure-tests.ts` | 63 assertions |

`npm run result:test`

### The grouping works on the real read

The July 29 session is a genuine 5-item multi-object read, and the flat list
does flatten it confusingly. Grouped:

| item | lane | group |
|---|---|---|
| Seal drafts around the sliding door/window | BUY | **Windows** |
| Replacing the dated blinds can wait | WAIT | **Window treatments** |
| Add a smoke detector | MONITOR | **Smoke & CO alarms** |
| Sloped-ceiling crack | MONITOR | **Ceiling** |
| Attic bathroom exhaust | MONITOR | **Tub & shower** |

The BUY and the WAIT land in **different groups** — asserted by test. That is
the confusion this release exists to fix, reproduced on real data even though
the specific door session doesn't exist.

### Focus selector

On that read, focus = **smoke detector** (composite 0.48), beating the
draft-sealing BUY (0.71) because safety class outranks score. Stable across
input order; seeded ties break by `sortOrder` then `key`.

### Arbitrage table — for your spot-check (§2)

Both entries quote `window-film-vs-replacement-vermont` verbatim:

| category | delta | source line |
|---|---|---|
| `window_weatherization` | $320–$385/window | "Custom acrylic interior storm inserts (Indow-style, **$400+/window** — premium tier when film does 80% of the job)" |
| `window_treatment` | $110–$260/window | "Designer insulated curtains (**$150-300/window** — same R-value as **$40** thermal liner)" |

**The V-strip entry the spec names is deliberately absent.** That guide line
reads *"'Premium' weatherstripping at 5x the price of standard V-strip"* — a
ratio, not a figure. Under CR2 a ratio cannot ground a dollar delta, so I did
not invent one. Give me a real price pair and it's a one-line addition.

### One design property worth knowing

A `ResolvedProduct` price is a **point**, not a range. A read whose only price
data is resolved prices collapses `low === high`, and §1.4's "always a range,
never a point estimate" correctly rejects it rather than rendering "$85–$85".
So resolved prices alone never produce an estimate; they need a second SKIP or
an arbitrage match. My first test asserted the opposite and was wrong.

## What did NOT get built

- **UI components** — inventory strip, grouped sections, focus module, upsell
  modules. The logic they consume is done and tested; the rendering is not.
- **Cart email template** mirroring the grouping.
- **Events** — `FOCUS_ITEM_RENDERED`, `UPSELL_SHOWN`, `UPSELL_CLICKED`,
  `SAVINGS_ESTIMATE_SHOWN`, `SUBJECT_UNGROUNDED`. The estimator already returns
  the full arithmetic in `components` for the payload; nothing emits it yet.
- **Dashboard upsell-CTR panel.**
- **§1.2 `subject` schema + prompt change** — deliberately deferred, above.
- Screenshots, deploy, checkpoint, Resend email.

Because no UI renders, the DOM asserts in §2 (CR4 upsell cap, no-`$`-in-
fallback, coaching-state zero-upsell, CR3 lane linking) could not run. Their
logic-layer equivalents are asserted: the cap constant, the fallback carrying
no digits, and the estimator returning null rather than a number.

## Recommended next

1. Build the four UI components against the tested logic, then the events.
2. Decide on the eval corpus. Three packs in a row have specified against data
   that does not exist; the founder 5-fixture set has been open since v7.4.8.
   Until it exists, §1.2 and anything else prompt-adjacent stays unshippable.
3. Merge order is now load-bearing: `v7.4.13` → `v7.4.14` → `v7.4.15` →
   `v7.4.16`, with 7.4.16 branched off 7.4.14. Four branches are stacked
   unmerged, and the refund fix in this one is the most urgent thing in any of
   them.
