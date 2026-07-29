# Morning report — v7.4.15 Social Reminder Cron

Run: 2026-07-28 overnight, unattended. Branch `v7.4.15-social-cron`, 1 commit
off `main`. **Complete and verified locally. Not deployed — and this release is
worthless undeployed, see below.**

---

## Deploy urgency: the first reminder fires in ~36 hours

`w0-cb1` is due **2026-07-30T12:30:00Z** (Wed Jul 30, 8:30am ET). Server clock
at build time was 2026-07-29T01:05Z. Nothing fires until this is on production
with `CRON_SECRET` set.

If it lands late, the design already handles it: entries under 24h old send
normally, anything older collapses into one `MISSED:` digest rather than
flooding. But the first three warmup blocks are the point of the warmup — late
delivery costs you the Reddit account history before the Aug 4 post.

## One risk I could not close: the Vercel plan tier

§0.2 asked me to confirm cron slots. I could not read the plan from the API.
What I know:

- `vercel.json` already declares **6 crons**, all daily/weekly, and they run.
- Vercel **Hobby** allows **2 cron jobs, once per day**. **Pro** allows 40 with
  arbitrary frequency.
- Six working crons implies **Pro**, in which case `*/15 * * * *` is fine.
- But `src/app/api/cron/autoeval/route.ts:9` says "maxDuration is the Hobby
  fluid ceiling," which is either stale or means the account is Hobby.

**Watch the deploy output.** If the plan is Hobby, Vercel rejects the
sub-daily schedule at build and the whole deploy fails — you would notice, but
you would notice at 2am. If that happens, the fallback is a daily schedule,
which breaks the 8:45-prep-vs-9:30-post separation this release exists for
(they are 45 minutes apart; a daily cron cannot distinguish them). The real fix
would be an external pinger hitting the route every 15 minutes.

Everything else about the route is plan-independent.

## What shipped

| File | Purpose |
|---|---|
| `src/config/socialCalendar.json` | 23 entries, verbatim |
| `src/lib/social/reminders.ts` | selection, rendering, near-empty warning |
| `src/app/api/cron/social-reminders/route.ts` | the cron route |
| `vercel.json` | 7th cron, `*/15 * * * *` |
| `src/lib/email/scoreboard.ts` | near-empty warning in the daily digest |
| `scripts/social/reminder-tests.ts` | 32 assertions |

`npm run social:test`

Reuses the existing conventions exactly: Bearer `CRON_SECRET` with no
user-agent or admin-session fallback (matching `autoeval`), and the same Resend
sender identity (`ALERT_FROM_EMAIL` → `ALERT_EMAIL`, defaulting to
`hello@alderprojects.com`). Zero schema change — idempotency is an `EventLog`
row keyed `SOCIAL_REMINDER_SENT` + `subjectId = entryId`.

Selection is a pure function of `(calendar, alreadySentIds, now)`, which is why
every §2 case below could be tested without waiting on a clock.

**Design note.** An entry is marked sent only *after* Resend confirms. A send
failure therefore retries on the next 15-minute run rather than being silently
swallowed — the failure mode is a duplicate email, never a missed reminder.

## Verification

`npx tsc --noEmit` → 0 errors. `npm run social:test` → **32/32 pass**.

**Calendar integrity:** 23 entries, unique ids, all timestamps parse and are
explicit `Z`, chronological, multi-line post copy survives JSON round-tripping
(both the modmail block and the `TITLE:\n…\nBODY:` structure).

**Timezone (§2).** Rather than spot-check one entry, the test parses every
`localLabel` and asserts it equals `sendAtUtc` converted at EDT (UTC−4).
**All 23 agree.** `w1-post` = 13:30Z = 9:30am ET, `w1-prep` = 12:45Z = 8:45am
ET, and the test asserts they are exactly 45 minutes apart — the separation the
15-minute schedule exists to preserve.

**Idempotency (§2):** first run selects the due entry; second run with the
EventLog row present selects nothing.

**Missed handling (§2):** a 30h-old entry classifies as missed, not due; 23h59
is still a normal send; a fully paused calendar resumed on Aug 20 yields 23
missed / 0 individual sends, collapsed into one `MISSED: 23 social reminders`
email containing every body.

**Near-empty (§2):** null at 23 ahead; warns below 3; distinct message at zero;
names the file to append to.

**Live, against the dev server on the production database:**

```
unauthenticated           → 401
wrong bearer              → 401
authed ?dryRun=1          → {"ok":true,"dryRun":true,"due":[],"missed":[],
                             "futureCount":23,"alreadySentCount":0}
```

The dry-run exercised the real prod `EventLog` read path. Confirmed by SQL:
`SELECT COUNT(*) FROM "EventLog" WHERE "eventType"='SOCIAL_REMINDER_SENT'` → **0**.

**Not verified: the Resend send and the `markSent` write.** Proving those
end-to-end means sending a real email and writing a `SOCIAL_REMINDER_SENT` row
for a fake entry into the production EventLog. I did not do that to a live
table for an undeployed release — it would leave a junk row keyed to an entryId
that isn't in the calendar. The send helper mirrors `sendScoreboard()` field
for field, and `markSent` uses the standard `logEvent()`. Both are exercised by
the §2 checkpoint below.

## Checkpoint to run after deploy

1. Confirm `CRON_SECRET` is set in production (it is already, for the existing
   crons).
2. Dry-run: `curl -H "Authorization: Bearer $CRON_SECRET" https://alderprojects.com/api/cron/social-reminders?dryRun=1`
   — expect `futureCount` counting down as entries pass.
3. Real send: temporarily append an entry with `sendAtUtc` a minute in the past,
   deploy, let one run fire, confirm the email lands at `hello@` with the body
   verbatim, then remove the entry. Its `SOCIAL_REMINDER_SENT` row stays, which
   is harmless.
4. Idempotency: hit the route twice; confirm one email and
   `SELECT COUNT(*) FROM "EventLog" WHERE "eventType"='SOCIAL_REMINDER_SENT' AND "subjectId"='<id>'` = 1.

## Note on calendar content

Two entries reference things worth knowing:

- `w0-preflight` (Aug 1) asks you to confirm **v7.4.14 is live** — it is not.
  That branch is built and tested but unmerged, so the Aug 4 post's "real
  example rendering" precondition is not yet met.
- `w1-prep` asks you to verify the `$400/window vs $65 film` and `$4 V-strip`
  claims against your guides before posting. I did not check those — the spec
  assigns that to you, and the reminder does its job of surfacing it.
