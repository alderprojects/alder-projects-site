/**
 * v7.4.15 §2 — the parts of the reminder test plan that are pure functions.
 * (Dry-run + the double-run SQL idempotency check run against a deploy.)
 */
import {
  SOCIAL_CALENDAR,
  selectDue,
  subjectFor,
  bodyFor,
  missedDigest,
  nearEmptyWarning,
  MISSED_AFTER_HOURS,
  NEAR_EMPTY_THRESHOLD,
  type SocialEntry,
} from '@/lib/social/reminders'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) }
  else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

const NONE: ReadonlySet<string> = new Set()
const entry = (id: string): SocialEntry => SOCIAL_CALENDAR.find((e) => e.entryId === id)!

console.log('\n=== calendar integrity ===')
{
  // Count is NOT asserted: the calendar is appended to over time, and a
  // hardcoded number turns every legitimate addition into a red test.
  check('calendar is populated', SOCIAL_CALENDAR.length >= 20, String(SOCIAL_CALENDAR.length))
  const ids = SOCIAL_CALENDAR.map((e) => e.entryId)
  check('entryIds unique', new Set(ids).size === ids.length)
  check('every sendAtUtc parses', SOCIAL_CALENDAR.every((e) => !isNaN(Date.parse(e.sendAtUtc))))
  check('every sendAtUtc is explicit UTC (Z)', SOCIAL_CALENDAR.every((e) => e.sendAtUtc.endsWith('Z')))
  check('every entry has a non-empty body', SOCIAL_CALENDAR.every((e) => e.body.trim().length > 0))
  check('chronological order preserved in the file',
    SOCIAL_CALENDAR.every((e, i) => i === 0 || Date.parse(e.sendAtUtc) >= Date.parse(SOCIAL_CALENDAR[i - 1].sendAtUtc)))
  // Multi-line post copy must survive JSON round-tripping.
  check('post-copy newlines preserved', entry('w1-prep').body.includes('\nBODY:\n'))
  check('modmail newlines preserved', entry('w0-modmail').body.includes('\n\nHi mods'))
}

console.log('\n=== §2: timezone — sendAtUtc matches localLabel (EDT, UTC-4) ===')
{
  // Assert the conversion arithmetic rather than waiting for a clock.
  const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  let mismatches: string[] = []
  for (const e of SOCIAL_CALENDAR) {
    // localLabel e.g. "Tue Aug 4 9:30am ET"
    const m = e.localLabel.match(/^\w{3} (\w{3}) (\d{1,2}) (\d{1,2}):(\d{2})(am|pm) ET$/)
    if (!m) { mismatches.push(`${e.entryId}: unparseable label "${e.localLabel}"`); continue }
    const [, mon, day, hh, mm, ampm] = m
    let hour = Number(hh) % 12
    if (ampm === 'pm') hour += 12
    // EDT is UTC-4, so the UTC instant is local + 4h.
    const expected = Date.UTC(2026, MONTHS[mon], Number(day), hour + 4, Number(mm))
    const actual = Date.parse(e.sendAtUtc)
    if (expected !== actual) {
      mismatches.push(`${e.entryId}: label ${e.localLabel} → ${new Date(expected).toISOString()} but file says ${e.sendAtUtc}`)
    }
  }
  check('all 23 labels agree with their UTC timestamps', mismatches.length === 0, '\n    ' + mismatches.join('\n    '))

  // The case the 15-minute schedule exists for.
  check('w1-post is 13:30Z = 9:30am ET', entry('w1-post').sendAtUtc === '2026-08-04T13:30:00Z')
  check('w1-prep is 12:45Z = 8:45am ET', entry('w1-prep').sendAtUtc === '2026-08-04T12:45:00Z')
  check('prep and post are 45 min apart — a daily cron could not separate them',
    Date.parse(entry('w1-post').sendAtUtc) - Date.parse(entry('w1-prep').sendAtUtc) === 45 * 60 * 1000)
}

console.log('\n=== §1: selection ===')
{
  const before = new Date('2026-07-29T00:00:00Z')
  const sel = selectDue(before, NONE)
  check('nothing due before the first entry', sel.due.length === 0 && sel.missed.length === 0)
  check('everything is future', sel.future.length === SOCIAL_CALENDAR.length)

  // Exactly at the first entry's time.
  const atFirst = new Date('2026-07-30T12:30:00Z')
  const s2 = selectDue(atFirst, NONE)
  check('due at exactly sendAtUtc (<= now, not <)', s2.due.map((e) => e.entryId).includes('w0-cb1'))

  const oneMinBefore = new Date('2026-07-30T12:29:00Z')
  check('not due one minute early', selectDue(oneMinBefore, NONE).due.length === 0)

  // The 8:45 / 9:30 separation the schedule exists for.
  const at845 = new Date('2026-08-04T12:45:00Z')
  const due845 = selectDue(at845, new Set(SOCIAL_CALENDAR.filter((e) => e.entryId !== 'w1-prep' && e.entryId !== 'w1-post').map((e) => e.entryId)))
  check('at 8:45 the prep fires and the post does not',
    due845.due.map((e) => e.entryId).join(',') === 'w1-prep', due845.due.map((e) => e.entryId).join(','))
}

console.log('\n=== §2: idempotency ===')
{
  const now = new Date('2026-07-30T13:00:00Z')
  const first = selectDue(now, NONE)
  check('first run selects the due entry', first.due.length === 1 && first.due[0].entryId === 'w0-cb1')

  // Second run, with the EventLog row now present.
  const second = selectDue(now, new Set(['w0-cb1']))
  check('second run selects nothing (one email, one row)', second.due.length === 0 && second.missed.length === 0)
}

console.log('\n=== §2: missed handling (>24h) ===')
{
  // w0-cb1 due 2026-07-30T12:30Z; 30h later is 2026-07-31T18:30Z.
  const thirtyHoursLater = new Date('2026-07-31T18:30:00Z')
  const sel = selectDue(thirtyHoursLater, new Set(SOCIAL_CALENDAR.filter((e) => e.entryId !== 'w0-cb1').map((e) => e.entryId)))
  check('a 30h-old entry is classified missed, not due',
    sel.missed.map((e) => e.entryId).includes('w0-cb1') && sel.due.length === 0)

  // Boundary: 23h59 is still an ordinary send.
  const justUnder = new Date(Date.parse('2026-07-30T12:30:00Z') + (MISSED_AFTER_HOURS * 3600 - 60) * 1000)
  const under = selectDue(justUnder, new Set(SOCIAL_CALENDAR.filter((e) => e.entryId !== 'w0-cb1').map((e) => e.entryId)))
  check('just under 24h is a normal send', under.due.map((e) => e.entryId).includes('w0-cb1'))

  // A long pause collapses into ONE digest rather than N emails.
  const afterPause = new Date('2026-08-20T00:00:00Z')
  const flood = selectDue(afterPause, NONE)
  check('a resumed cron produces many missed, zero individual sends',
    flood.missed.length === SOCIAL_CALENDAR.length && flood.due.length === 0,
    `missed=${flood.missed.length} due=${flood.due.length}`)
  const digest = missedDigest(flood.missed)
  check('missed digest is a single email with MISSED: prefix',
    digest.subject.startsWith(`MISSED: ${SOCIAL_CALENDAR.length}`), digest.subject)
  check('missed digest contains every entry body',
    flood.missed.every((e) => digest.body.includes(e.body.slice(0, 40))))
}

console.log('\n=== §1: email format ===')
{
  const e = entry('w1-post')
  check('subject = ⏰ [SOURCE] — [TITLE]',
    subjectFor(e) === '⏰ r/SideProject — POST NOW — then live in comments until 11:30', subjectFor(e))
  check('body is verbatim, nothing appended', bodyFor(e) === e.body)
  check('body carries no markup', !/<[a-z]/i.test(bodyFor(entry('w1-prep'))))
}

console.log('\n=== §2: near-empty warning ===')
{
  const early = new Date('2026-07-29T00:00:00Z')
  check('no warning with 23 ahead', nearEmptyWarning(early) === null)

  // Two entries remain after Aug 14.
  const late = new Date('2026-08-15T00:00:00Z')
  const w = nearEmptyWarning(late)
  check('warns when under the threshold', w != null && /nearly empty/.test(w), String(w))
  check('warning names the file', w != null && w.includes('socialCalendar.json'))
  check('threshold is 3', NEAR_EMPTY_THRESHOLD === 3)

  const exhausted = new Date('2027-01-01T00:00:00Z')
  const w2 = nearEmptyWarning(exhausted)
  check('distinct message when fully empty', w2 != null && /empty —/.test(w2), String(w2))
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
