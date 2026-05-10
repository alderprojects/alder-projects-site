// One-off: validate the v7.2.14 pilot guides against the topic-guide template rules.
import { WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT } from '../src/content/topics/window-film-vs-replacement-vermont'
import { BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT } from '../src/content/topics/before-finishing-basement-moisture-checks-vermont'
import { validateTopicGuide } from '../src/content/templates/topic-guide-template'

for (const c of [
  WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT,
  BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT,
]) {
  const v = validateTopicGuide(c)
  if (v.length === 0) console.log(`${c.slug}: PASS`)
  else {
    console.log(`${c.slug}: FAIL`)
    for (const m of v) console.log('  - ' + m)
  }
}
