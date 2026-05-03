# Real Talk VT Voice Guide

Last verified: 2026-05-03

This is the cornerstone document for every guide, town page, season
page, or rewrite written under V6 and after. Every writing pass —
human or AI — reads this BEFORE drafting and runs the self-rubric
at the bottom BEFORE committing.

If you find yourself writing prose that fails this guide, the rule
is to fix the prose, not soften the guide. The voice is the moat.

---

## What this voice is

A Vermonter who has owned property here for 20 years explaining
things to a friend who just bought their first Vermont place.
Knowledgeable. Slightly weary. Specific. Distrustful of marketing
language. Generous with the details that actually matter.

The reader is smart, busy, and has already googled the obvious
question. They didn't come for "what is a heat pump" — they came
because the EVT rebate page didn't tell them which rebates stack,
and the contractor they called won't put a number in writing.

## What this voice is not

- An SEO content writer in another state guessing at Vermont specifics
- A marketing copywriter ("explore our comprehensive guide")
- An HVAC blogger writing for the national audience
- An AI listicle padder
- A lawyer hedging every claim into uselessness
- A booster ("Vermont is a wonderful state for homeowners!")

If a paragraph could appear unchanged on a homeowner-services site
based in Phoenix, the paragraph is wrong.

---

## The seven voice rules

### Rule 1: Open with the actual problem.

The first sentence of every guide, every section, names the real
problem the reader has. Not the topic. Not the SEO target. The
problem.

Bad: "Vermont kitchen remodels can be exciting projects."
Bad: "If you're considering a kitchen remodel in Vermont, there
are several factors to consider."
Bad: "Welcome to our comprehensive guide on Vermont kitchen
renovations."

Good: "Your 1860s farmhouse has 9-foot ceilings and a load-bearing
wall between the kitchen and dining room. That one detail moves
the cost math more than anything else."

Good: "The contractor's estimate is $58,000. The neighbor down
the road paid $42,000 for what looks like the same kitchen. They
are both telling the truth — and you need to know why before you
sign."

### Rule 2: Specifics over claims.

Replace adjectives with facts. Replace "unique" with the actual
specific. Replace "various" with the count.

Bad: "Vermont has unique permitting requirements."
Good: "Vermont's Act 47 (effective July 2024) overrides most town
ADU caps statewide. Your town's bylaw saying 'no ADUs over 800
sq ft' isn't enforceable anymore."

Bad: "There are several rebates available."
Good: "Four rebates can stack on a single heat pump install:
$2,200 EVT ducted, $475 EVT ductless per head, $400 fuel-switch
bonus, and $500 panel-upgrade rebate. Total stack at peak: ~$3,500
on a $14,000 install."

### Rule 3: State the trap.

Every section has at least one "Trap:" callout. Three minimum
per full guide.

A trap callout has three parts:
1. The cost-of-being-wrong (in dollars or hours)
2. Why people fall into it (it's not stupidity — it's a
   sensible-seeming default that's wrong here)
3. The workaround in one sentence

Example:
"**Trap:** Most homeowners pull the building permit themselves
because the contractor offers to save them $200 in fees. In
Vermont, the person whose name is on the permit is responsible
for code compliance. So you saved $200 and bought yourself
liability for the contractor's mistakes. **Workaround:** insist
on a contractor-pulled permit, even if it costs more."

Example:
"**Trap:** The contractor quote is dated April 5. You sign April
20. The quote says 'valid for 30 days' — but lumber went up 11%
in those two weeks. The contractor will absorb it once. They
won't absorb it twice. **Workaround:** sign within 7 days of
quote, or ask in writing for a price-lock with a 14-day window."

### Rule 4: Numbers with context.

Every dollar figure or rebate amount comes with: the date verified,
the source, and what the number actually means in practice.

Bad: "$2,200 rebate"
Good: "$2,200 EVT ducted heat pump rebate (verified Apr 2026,
Efficiency Vermont) — paid by EVT directly to the contractor at
job completion, so it shows up as a net invoice line, not a check
you receive."

The point isn't pedantry. It's that "I'll get $2,200 back" and
"my bill will be $2,200 lower" are different cash-flow stories
and homeowners get burned by the wrong assumption.

In V6 onward, all numbers come from `src/content/facts.ts`, not
hardcoded in prose. If a number isn't in facts.ts yet, add it
there first. One source of truth.

### Rule 5: Acknowledge what you don't know.

Vermont rules change. EVT funding levels shift. Federal credits
expire. Don't promise certainty you can't deliver.

Use:
- "As of [date]"
- "Verify with the town clerk before signing anything"
- "The installer confirms eligibility when they file the rebate
  — we cannot promise it"
- "Rules changed in 2025; verify current state"
- "The FACTS table flag is set to re-verify after [date]"

Epistemic humility reads as expertise. Confident misstatements
read as marketing.

### Rule 6: One Vermont specific per H2 minimum.

Every H2 section needs at least one detail that signals the
writer knows Vermont. Real road names, real historic district
rules, real Vermont contractors-association practices, real
utility quirks (BED vs GMP vs VPPSA), real flood event references
(Irene 2011, July 2023 flooding), real statute citations.

If a section can be lifted unchanged into a Massachusetts version
of the same guide, it fails Rule 6.

Examples of qualifying specifics:
- "BED (Burlington Electric Department) treats heat pump
  installs differently from GMP — BED's incentive runs through
  EVT, GMP's runs in-house."
- "If your property is on Route 100 between Stowe and Waterbury,
  expect Mountain Road design review."
- "9 V.S.A. § 4006 requires a written contract for any residential
  job over $1,000."
- "Most NEK towns post mud-season weight limits between March 1
  and May 15. Your contractor's truck physically cannot reach
  the site for six weeks."
- "VPPSA-member utilities (Hyde Park, Stowe, Northfield, Ludlow,
  Lyndonville, Hardwick, Morrisville, Enosburg, Swanton, Barton,
  Jacksonville, Johnson, Orleans, Readsboro) bill differently
  than GMP."

### Rule 7: End with action.

Last paragraph of every section answers "so what do I do?" — not
"consider consulting a professional" but "call the town clerk
Monday morning before doing anything else, and ask specifically
about [the thing]."

Bad: "Make sure you understand the requirements before starting
your project."

Good: "Before signing the contract: call your town clerk Monday
morning and ask whether your lot is in the design-review overlay.
If it is, ask for a copy of the design standards PDF. Read it
before the bid review. The contractor's bid should already
include design-review prep time — if it doesn't, that's a $1,500-
3,000 line item you're about to discover after signing."

---

## Banned phrases (never use)

Marketing/SEO filler:
- "Comprehensive guide"
- "Everything you need to know"
- "Ultimate guide"
- "Expert tips"
- "Game-changer"
- "In today's market"
- "Industry-leading"
- "Streamlined process"
- "Solutions that fit your needs"
- "Best-in-class"
- "Cutting-edge"
- "World-class"
- "Innovative solutions"

Marketplace-era leftovers (V1-V3 carryover):
- "Reach out to discuss"
- "We'll match you with"
- "Vetted contractors in 48 hours"
- "Post your project free"
- "Two or three contractors"
- "Matching service"
- "We pull a few"
- "How is this different from Angi"

Sentence frames that read AI-generated:
- Any sentence beginning "Whether you're..."
- Any sentence ending "and so much more"
- Any sentence containing "navigate the complexities"
- "When it comes to [topic], [generic advice]"
- "It's important to note that..."
- "It's worth mentioning that..."
- "Without further ado..."

If you find one of these in a draft, the prose is failing. Rewrite
the sentence around the actual specific.

---

## Required phrases (use deliberately)

When applicable, prefer these:

- **"Trap:"** — callout for the common mistake (rule 3)
- **"Worth knowing:"** — mid-priority context that doesn't rise
  to a Trap
- **"What we don't know:"** — epistemic humility (rule 5)
- **"Vermont-specific:"** — state-of-state callouts (rule 6)
- **"As of [date]:"** — date-pinned facts (rule 4)
- **"Verify with [source]:"** — offload uncertainty cleanly
- **"In practice:"** — bridges from rule to lived reality

These aren't required in every paragraph. They are scaffolding
patterns that reinforce the voice when the content calls for them.

---

## Sentence rhythm

Mix short sentences and long ones. Short sentences carry weight.
Long sentences carry detail. A page of all-medium sentences reads
like AI output.

Example of good rhythm:

> Mud season is real. It runs roughly March 1 through May 15 in
> most of central and northern Vermont — the exact window depends
> on elevation, soil composition, and how much snow melted in any
> given week. What it means practically: dirt roads turn to soup.
> Heavy trucks can't get to your house. Your contractor stops
> calling back. The fix isn't to fight it; the fix is to plan
> around it.

Notice: 4 words. 38 words. 6 words. 7 words. 6 words. 13 words.

If five consecutive sentences are all 14-22 words, the paragraph
is sleepwalking. Break the rhythm.

---

## Structure expectations

Every guide has:

1. **H1** — a stated problem or question, not a topic label.
   Bad: "Vermont Heat Pump Rebates"
   Good: "Stack the right way: ~$7-17k off a Vermont heat pump"

2. **Lead paragraph** — 2-4 sentences. Names the actual problem
   the reader has. Hooks with a specific number, statute, or
   trap.

3. **6-12 H2 sections**, each:
   - Opens with the section's problem (rule 1)
   - At least one Vermont specific (rule 6)
   - At least one cited number where applicable (rule 4)
   - Ends with concrete next action (rule 7)

4. **At least 3 "Trap:" callouts** across the guide

5. **FAQ section** — 4-6 questions a real Vermont homeowner would
   ask. Not "What is a heat pump?" but "If I switch to a heat
   pump, will my January electric bill spike enough to wipe out
   the savings?"

6. **Sources block** — auto-rendered by `<GuideFooter />` from
   the `factIds` array

7. **Byline + last-verified date** — auto-rendered by `<GuideFooter />`

8. **Property tool funnel** — auto-rendered by `<GuideFooter />`

---

## Affiliate placement rules

Maximum density: **one affiliate link per 1,500 characters** of
body text. Higher density triggers AdSense / search-quality flags
and reads as spam.

When linking a product:
- Use the real product name where you genuinely vouch for it
  ("Mr. Buddy Big Buddy heater")
- Use Amazon search URL via `buildAmazonUrl()` as the fallback
- Never link a product you wouldn't actually recommend to the
  Vermont homeowner described in your intro paragraph

If a kit is included, place it once, in context, with one
sentence explaining *why this thing for this Vermont reader*.
Not "check out our hand-picked products" — "the Big Buddy is the
one heater Vermont second-home owners reliably use during the
December-to-March stretch when they're not on-site enough to
justify oil delivery."

---

## Internal linking minimums

Every guide:
- ≥ 5 outbound internal links
- ≥ 1 link to property tool funnel (`/`)
- ≥ 1 link to a town page
- ≥ 2 links to other guides (use V4 TOPIC_AFFINITY to choose
  which — high-affinity neighbors first)

Every town page:
- ≥ 5 outbound internal links
- ≥ 1 link to property tool with town pre-filled
- ≥ 3 links to relevant guides

Every town × service page:
- ≥ 3 outbound internal links
- ≥ 1 link to property tool
- ≥ 1 link to relevant cost or rebate guide

---

## Self-rubric — run before committing any guide

Before any content commit, the writing instance reads the guide
it just wrote and checks each item below. If any item fails, the
writing instance fixes the guide and re-runs the rubric BEFORE
committing.

This is not optional. The rubric is the moat.

- [ ] First sentence states the actual problem (not a generic intro)
- [ ] At least one Vermont-specific detail per H2 section
- [ ] At least three "Trap:" callouts in the full guide
- [ ] Every dollar figure pulls from `FACTS` or has verifyDate + source
- [ ] No banned phrases present (search the draft against the
      banned list above)
- [ ] Mix of short + long sentences (no run of 5+ medium-length
      sentences)
- [ ] FAQ section answers questions a real Vermont homeowner
      would ask, not generic search-engine questions
- [ ] Last paragraph of every section gives a concrete next action
- [ ] Internal links: at least 3 outbound to other guides, 1 to
      a town page, 1 to property tool
- [ ] Affiliate links use real product names where genuinely
      vouched, Amazon search URLs as fallback
- [ ] Affiliate density: max 1 link per 1,500 chars
- [ ] `<GuideFooter />` renders with `factIds` matching every
      cited number
- [ ] JSON-LD blocks present: Article + BreadcrumbList; FAQPage
      if FAQ section exists
- [ ] Body length meets the type minimum:
      - Standalone town: ≥ 1,200 chars
      - Seasonal guide: ≥ 7,000 chars
      - Topic guide: ≥ 7,000 chars
      - Town × service: ≥ 1,500 chars

If commit-time `voice-regression-test.ts` (commit 17) flags any
violation, the build fails. Fix the violation; do not weaken the
test.

---

## Editing your own draft

After drafting, read it twice:

1. **First pass — voice.** Is the opening paragraph specific?
   Does each H2 open with a problem, not a topic? Does the rhythm
   vary? Are there banned phrases?

2. **Second pass — facts.** Is every dollar figure pulled from
   `FACTS`? Does every "Trap:" callout name the actual cost-of-
   being-wrong? Are sources cited cleanly?

If either pass surfaces issues, fix them before committing. The
goal isn't a clean draft on the first try — the goal is a clean
guide on the commit.

---

## A note on what this is for

These rules exist because the moat for this site is content
quality that compounds over years and resists AI-slop displacement.

A competitor with a GPT subscription can spin up 500 generic
Vermont contractor pages tomorrow. They cannot spin up 500 pages
that name the Mountain Road design-review trap, cite 9 V.S.A.
§ 4006 with the right exception, and acknowledge that the EVT
rebate is paid to the contractor (not to the homeowner) without
a Vermont resident reviewing every line.

The voice is the moat. Hold it.
