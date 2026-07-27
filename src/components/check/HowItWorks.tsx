/**
 * v7.4.2c — "How a Check works" strip. Three illustrated steps —
 * server-rendered, shared by `/` and `/check`. Breaks up the text wall
 * with the CheckArt vignettes.
 */

import { CHECK_PALETTE as C, HOW_IT_WORKS } from '@/lib/check/content'
import { StepSnapArt, StepVerdictArt, StepCartArt } from './CheckArt'

const ART = [StepSnapArt, StepVerdictArt, StepCartArt]

export default function HowItWorks() {
  return (
    <section style={{ maxWidth: 980, margin: '0 auto', padding: '8px 20px 40px' }}>
      <h2
        style={{
          fontSize: 14,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.gold,
          textAlign: 'center',
          marginBottom: 18,
          fontWeight: 700,
        }}
      >
        {HOW_IT_WORKS.header}
      </h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {HOW_IT_WORKS.steps.map((step, i) => {
          const Art = ART[i]
          return (
            <div
              key={step.title}
              style={{
                background: '#fff',
                border: '1px solid rgba(31,61,43,0.12)',
                borderRadius: 12,
                padding: '22px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <Art />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: '0.08em', marginBottom: 4 }}>
                STEP {i + 1}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.green, marginBottom: 6 }}>{step.title}</div>
              <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>{step.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
