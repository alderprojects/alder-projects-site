import Link from 'next/link'
import { CONFIG } from '@/lib/recommender-config'
import { getTrackedVermontTownCount } from '@/data/projects'

// V5 footer. Replaces V4's marketplace-era copy ("renovation matching
// service", "popular searches", "how we make money") with property-tool
// framing. Top town links pull from CONFIG.homepage.townGrid.towns so
// the homepage town grid and the footer stay in sync.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(245,239,224,0.5)',
  inkFaint: 'rgba(245,239,224,0.3)',
  bg: '#0F1A0E',
  border: 'rgba(122,155,111,0.1)',
  cream: '#F5EFE0',
  greenAccent: '#7A9B6F',
  accent: '#C8732A',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'
const FS = "'Playfair Display', Georgia, serif"

const linkStyle = {
  color: C.inkSoft,
  fontSize: 13,
  fontFamily: FB,
  textDecoration: 'none',
  display: 'block',
  padding: '4px 0',
}

export default function Footer() {
  const topTowns = CONFIG.homepage.townGrid.towns
  const townCount = getTrackedVermontTownCount()

  return (
    <footer
      style={{
        background: C.bg,
        padding: 'clamp(56px,8vw,80px) 24px',
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill={C.greenAccent} />
                <path d="M14.5 16L16 12L17.5 16H14.5Z" fill={C.accent} />
              </svg>
              <span
                style={{
                  fontFamily: FS,
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.cream,
                }}
              >
                Alder Projects
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                fontFamily: FB,
                color: C.inkSoft,
                lineHeight: 1.55,
                margin: '0 0 10px',
                maxWidth: 240,
              }}
            >
              Practical project guidance for Vermont homes.
            </p>
            <a
              href="mailto:hello@alderprojects.com"
              style={{
                fontSize: 12,
                fontFamily: FM,
                color: C.greenAccent,
                textDecoration: 'none',
              }}
            >
              hello@alderprojects.com
            </a>
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                fontFamily: FM,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.inkFaint,
                margin: '0 0 12px',
              }}
            >
              Towns
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topTowns.map(t => (
                <li key={t.pageSlug}>
                  <Link href={`/${t.pageSlug}`} style={linkStyle}>
                    {t.town}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={CONFIG.homepage.crossLinks.townsIndex}
                  style={{ ...linkStyle, color: C.accent, fontWeight: 500 }}
                >
                  All {townCount} Vermont towns →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                fontFamily: FM,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.inkFaint,
                margin: '0 0 12px',
              }}
            >
              Guides
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <Link
                  href={CONFIG.homepage.crossLinks.mudSeasonArticle}
                  style={linkStyle}
                >
                  Mud season guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                fontFamily: FM,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.inkFaint,
                margin: '0 0 12px',
              }}
            >
              About
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <Link href={CONFIG.homepage.crossLinks.disclosure} style={linkStyle}>
                  How we keep this free (affiliate disclosure)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <p
            style={{
              fontSize: 12,
              fontFamily: FM,
              color: C.inkFaint,
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            © {new Date().getFullYear()} Alder Projects LLC · Vermont, USA
          </p>
        </div>
      </div>
    </footer>
  )
}
