/**
 * v7.4.15 — Social reminder scheduling.
 *
 * Reminders only. Nothing here posts anywhere: the email carries copy for a
 * human to paste, and a human presses submit on Reddit (§ non-goals).
 *
 * Selection is a pure function of (calendar, alreadySentIds, now) so the
 * §2 cases — due/not-due, idempotency, the 24h missed cutoff, timezone
 * conversion — are all testable without a clock, a DB, or an email.
 */

import calendar from '@/config/socialCalendar.json'

export interface SocialEntry {
  entryId: string
  sendAtUtc: string
  localLabel: string
  source: string
  title: string
  body: string
}

export const SOCIAL_CALENDAR: SocialEntry[] = calendar as SocialEntry[]

/** Entries older than this at send time go into one MISSED digest. */
export const MISSED_AFTER_HOURS = 24

/** Warn in the daily digest when fewer than this many entries remain. */
export const NEAR_EMPTY_THRESHOLD = 3

export const SOCIAL_REMINDER_SENT = 'SOCIAL_REMINDER_SENT'

export interface Selection {
  /** Due, recent, and unsent — one email each, verbatim. */
  due: SocialEntry[]
  /**
   * Due, unsent, but more than MISSED_AFTER_HOURS old — collapsed into a
   * single digest so a paused-then-resumed cron cannot flood the inbox.
   */
  missed: SocialEntry[]
  /** Not yet due. Used for the near-empty warning. */
  future: SocialEntry[]
}

/**
 * Decide what to send.
 *
 * `alreadySent` is the set of entryIds with a SOCIAL_REMINDER_SENT row —
 * the idempotency key. An entry present there is never selected again,
 * which is what makes a double cron run safe (§2).
 */
export function selectDue(
  now: Date,
  alreadySent: ReadonlySet<string>,
  entries: readonly SocialEntry[] = SOCIAL_CALENDAR
): Selection {
  const due: SocialEntry[] = []
  const missed: SocialEntry[] = []
  const future: SocialEntry[] = []
  const missedCutoffMs = MISSED_AFTER_HOURS * 60 * 60 * 1000

  for (const entry of entries) {
    const sendAt = new Date(entry.sendAtUtc)
    if (sendAt > now) {
      future.push(entry)
      continue
    }
    if (alreadySent.has(entry.entryId)) continue
    const lateBy = now.getTime() - sendAt.getTime()
    if (lateBy > missedCutoffMs) missed.push(entry)
    else due.push(entry)
  }

  const byTime = (a: SocialEntry, b: SocialEntry) => Date.parse(a.sendAtUtc) - Date.parse(b.sendAtUtc)
  return { due: due.sort(byTime), missed: missed.sort(byTime), future: future.sort(byTime) }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** subject = `⏰ [SOURCE] — [TITLE]` */
export function subjectFor(entry: SocialEntry): string {
  return `⏰ ${entry.source} — ${entry.title}`
}

/**
 * Body is the entry's `body` VERBATIM — no styling, no wrapper, no
 * signature. It is read on a phone and pasted into Reddit, so anything
 * added here becomes something to delete by hand.
 */
export function bodyFor(entry: SocialEntry): string {
  return entry.body
}

/** One digest for everything that slipped past the 24h cutoff. */
export function missedDigest(entries: readonly SocialEntry[]): { subject: string; body: string } {
  const subject = `MISSED: ${entries.length} social reminder${entries.length === 1 ? '' : 's'}`
  const body = entries
    .map((e) => `— ${e.localLabel} · ${e.source}\n${e.title}\n\n${e.body}`)
    .join('\n\n' + '-'.repeat(48) + '\n\n')
  return {
    subject,
    body: `These were due while the reminder job was not running. They are marked sent; act on whatever is still useful.\n\n${body}`,
  }
}

/**
 * Daily-digest line when the calendar is running out. Returns null while
 * there is still plenty scheduled.
 */
export function nearEmptyWarning(
  now: Date = new Date(),
  entries: readonly SocialEntry[] = SOCIAL_CALENDAR
): string | null {
  const remaining = entries.filter((e) => new Date(e.sendAtUtc) > now).length
  if (remaining >= NEAR_EMPTY_THRESHOLD) return null
  return remaining === 0
    ? 'Social calendar empty — no reminders scheduled. Append to src/config/socialCalendar.json.'
    : `Social calendar nearly empty — ${remaining} reminder${remaining === 1 ? '' : 's'} left. Append to src/config/socialCalendar.json.`
}
