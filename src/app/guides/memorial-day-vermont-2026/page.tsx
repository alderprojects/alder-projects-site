import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Memorial Day 2026 in Vermont — What to Buy & Skip | Alder Projects',
  description: "Vermont's honest Memorial Day shopping guide. 5 categories that are actually deals this weekend, 8 that are peak-pricing traps. Updated weekly through May 26.",
  alternates: { canonical: 'https://alderprojects.com/guides/memorial-day-vermont-2026' },
  openGraph: {
    title: 'Memorial Day 2026 in Vermont — What to Buy & Skip',
    description: "5 categories worth buying this weekend. 8 traps to skip. Updated weekly.",
    url: 'https://alderprojects.com/guides/memorial-day-vermont-2026',
    type: 'article',
  },
}

const LAST_VERIFIED = 'May 15, 2026'

const BUY_ITEMS = [
  {
    title: 'Mattresses',
    body: "Genuine year-best window before Labor Day. If you've been waiting, this is the buy. Vermont retailers honor manufacturer Memorial Day pricing, so local matches online.",
    status: 'Confirmed deals at Mattress Firm, Costco, and Vermont Furniture this week. Tempur-Pedic 25% off at multiple retailers — verified against MAP price, not inflated.',
  },
  {
    title: 'Major appliances (prior-year models)',
    body: 'New models hit floors in June, so May clears last year inventory at 20-30% off. Refrigerators, washers, dryers especially.',
    status: 'GE and Whirlpool prior-year models tracking 22-28% off at Lowe’s Williston and Home Depot. LG less aggressive this week — wait or check Costco.',
  },
  {
    title: 'Mid-tier gas grills',
    body: 'Weber Spirit, Char-Broil tier — real promo prices. Premium grills (BGE, Kamado Joe, Traeger) almost never discount Memorial Day. The grill comparison guide covers which one fits your cookout.',
    status: 'Weber Spirit II E-310 at $499 (normally $579) — confirmed deal, not markup-then-discount.',
    href: '/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost',
    hrefLabel: 'Read the grill comparison',
  },
  {
    title: 'Mulch and basic landscape supplies',
    body: 'Loss leaders at every box store. Bagged mulch, basic topsoil, grass seed all hit their real low. Vermont independents (Aubuchon, r.k. Miles) sometimes match.',
    status: 'Bagged mulch $3.49/2cf at Home Depot — actual low, not seasonal markup.',
  },
  {
    title: 'Tools with specific brand promos',
    body: 'DeWalt, Milwaukee 20V battery starter kits. Not all tools — specific promoted SKUs. Premium tools (Festool, Knipex) almost never discount Memorial Day; wait until Black Friday.',
    status: 'DeWalt 20V 4-tool combo $299 (normally $399). Milwaukee M18 starter kits also moving.',
  },
]

const WAIT_ITEMS = [
  {
    title: 'Patio furniture sets',
    body: 'Peak demand pricing through October. Year-best clearance hits November. If you can wait six months, you save 40-60%.',
    status: 'Every patio set in tracking at MSRP or within 5%. Skip.',
    href: '/guides/lake-season-buy-skip-wait',
    hrefLabel: 'Or build the $2,400 lean lake setup',
  },
  {
    title: 'Premium grills (BGE, Kamado Joe, Traeger)',
    body: 'Rarely discount before late July. The grill comparison guide walks through when each goes on real sale.',
    status: 'BGE Large still $1,099 at all VT dealers. July is the buy window.',
    href: '/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost',
    hrefLabel: 'Read the grill comparison',
  },
  {
    title: 'Outdoor cushions and pillows',
    body: 'Year-best clearance is September. Peak pricing now.',
    status: 'Sunbrella replacement cushion sets up 8% YoY at Frontgate and Pottery Barn. Bad time.',
  },
  {
    title: 'String lights (designer brands)',
    body: 'Pottery Barn, RH, Brightech all at MSRP. Comparison guide has the verdict.',
    status: 'Even Costco Brightech bundles are $4 higher than April.',
    href: '/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights',
    hrefLabel: 'Read the string light comparison',
  },
  {
    title: 'Premium tools (Festool, Knipex, Wera)',
    body: 'Black Friday is the buy window.',
    status: 'Zero meaningful promos in May. Hard wait.',
  },
]

const SKIP_ITEMS = [
  { title: '"Memorial Day exclusive" anything', body: 'Manufactured urgency. The same SKU sells at the same price two weeks later 80% of the time.' },
  { title: 'Outdoor decor and accents', body: 'Markup is highest in spring across the board — wreaths, lanterns, planters, throw pillows. Cushion clearance in September catches these too.' },
  { title: 'Folding "bistro sets" marketed as patio dining', body: 'These are balcony furniture priced like patio furniture. Wrong product, wrong price.' },
  { title: 'Glass-top patio tables', body: 'Crack from ice every Vermont winter. Wrong product regardless of price.' },
  { title: 'Wicker / rattan outdoor furniture', body: 'Mold magnet. Dead in two lake seasons.' },
  { title: '"Smart" outdoor anything', body: 'Wi-Fi grills, smart garden kits, lakeside propane heaters. Software dies, parts get discontinued, real failure mode is two seasons.' },
  { title: 'Pre-packaged "Memorial Day BBQ bundles"', body: 'Bundle pricing usually 15-25% above buying components separately. Always.' },
  { title: 'Premium charcoal in bulk', body: 'Charcoal hits real clearance in October-November. Buying summer’s supply in May is paying the markup.' },
]

const STYLES = {
  page: { minHeight: '100vh', backgroundColor: '#FAF7F2' },
  header: { backgroundColor: '#0D1A0B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandLink: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  brandText: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' },
  navRight: { display: 'flex', gap: '16px', alignItems: 'center' },
  navLink: { fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.5)', textDecoration: 'none' },
  navCTA: { padding: '7px 16px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '12px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' },
  heroWrap: { backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,64px) 24px' },
  heroInner: { maxWidth: '780px', margin: '0 auto' },
  eyebrow: { fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#C8732A', display: 'block', marginBottom: '14px' },
  h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '18px' },
  lede: { fontSize: '17px', color: 'rgba(245,239,224,0.7)', lineHeight: 1.65, margin: 0, maxWidth: '640px' },
  jumpRow: { marginTop: '24px', display: 'flex', flexWrap: 'wrap' as const, gap: '14px', fontSize: '13px', fontFamily: 'monospace' },
  jumpLink: { color: '#7A9B6F', textDecoration: 'none' },
  body: { maxWidth: '780px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) 24px 80px' },
  sectionLabel: { fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#7A9B6F', display: 'block', marginBottom: '8px' },
  h2: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '12px', lineHeight: 1.2 },
  sectionBlurb: { fontSize: '15px', color: 'rgba(28,43,26,0.7)', lineHeight: 1.65, marginBottom: '28px' },
  itemCard: { padding: '22px 24px', borderLeft: '3px solid #7A9B6F', backgroundColor: 'white', marginBottom: '14px', borderRadius: '0 4px 4px 0' },
  itemCardWait: { padding: '22px 24px', borderLeft: '3px solid #C8732A', backgroundColor: 'white', marginBottom: '14px', borderRadius: '0 4px 4px 0' },
  itemCardSkip: { padding: '18px 24px', borderLeft: '3px solid rgba(28,43,26,0.3)', backgroundColor: 'white', marginBottom: '10px', borderRadius: '0 4px 4px 0' },
  itemTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#1C2B1A', marginBottom: '8px', lineHeight: 1.3 },
  itemBody: { fontSize: '14px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.65, margin: '0 0 10px 0' },
  itemStatus: { fontSize: '13px', fontFamily: 'monospace', color: '#7A9B6F', backgroundColor: 'rgba(122,155,111,0.08)', padding: '8px 12px', borderRadius: '3px', display: 'block', lineHeight: 1.55 },
  itemLink: { fontSize: '13px', color: '#C8732A', textDecoration: 'none', display: 'inline-block', marginTop: '10px' },
  ctaBlock: { marginTop: '48px', padding: '32px', backgroundColor: '#1C2B1A', borderRadius: '6px', color: '#F5EFE0' },
  ctaH3: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, marginBottom: '14px', color: '#F5EFE0' },
  ctaP: { fontSize: '14px', color: 'rgba(245,239,224,0.7)', marginBottom: '20px', lineHeight: 1.65 },
  ctaPrimary: { display: 'inline-block', padding: '12px 22px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '14px', fontWeight: 600, borderRadius: '3px', textDecoration: 'none', marginRight: '12px', marginBottom: '8px' },
  ctaSecondary: { display: 'inline-block', padding: '12px 22px', backgroundColor: 'transparent', color: '#F5EFE0', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(245,239,224,0.3)', borderRadius: '3px', textDecoration: 'none', marginRight: '12px', marginBottom: '8px' },
  methodBlock: { marginTop: '48px', padding: '28px', borderLeft: '3px solid #1C2B1A', backgroundColor: 'rgba(28,43,26,0.04)' },
  methodH3: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#1C2B1A', marginBottom: '12px' },
  methodP: { fontSize: '14px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.7, marginBottom: '10px' },
  methodList: { fontSize: '14px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.7, paddingLeft: '20px' },
  vermontBlock: { marginTop: '40px', padding: '28px', backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '4px' },
  footnote: { marginTop: '40px', fontSize: '12px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.5)', textAlign: 'center' as const },
}

export default function MemorialDayVermont2026() {
  return (
    <div style={STYLES.page}>
      <header style={STYLES.header}>
        <Link href="/" style={STYLES.brandLink}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
          </svg>
          <span style={STYLES.brandText}>Alder Projects</span>
        </Link>
        <div style={STYLES.navRight}>
          <Link href="/guides" style={STYLES.navLink}>Guides</Link>
          <Link href="/calculator" style={STYLES.navLink}>Calculator</Link>
          <Link href="/smart-cart?topic=outdoor&scope=memorial_day_weekend&utm_source=memorial_day_2026&utm_medium=guide_nav" style={STYLES.navCTA}>Smart Cart $19.99</Link>
        </div>
      </header>

      <div style={STYLES.heroWrap}>
        <div style={STYLES.heroInner}>
          <span style={STYLES.eyebrow}>{LAST_VERIFIED} · Updated weekly through May 26</span>
          <h1 style={STYLES.h1}>Memorial Day in Vermont: what&rsquo;s a deal, what&rsquo;s a trap.</h1>
          <p style={STYLES.lede}>
            Memorial Day weekend is the most heavily marketed retail event of late spring. About a third of it is a real deal. The rest is peak-pricing dressed up with a flag graphic. We&rsquo;re tracking the actual numbers, not the ad copy.
          </p>
          <div style={STYLES.jumpRow}>
            <a href="#buy" style={STYLES.jumpLink}>↓ Actually buy this weekend</a>
            <a href="#wait" style={STYLES.jumpLink}>↓ Wait for a better window</a>
            <a href="#skip" style={STYLES.jumpLink}>↓ Outright traps</a>
            <a href="#method" style={STYLES.jumpLink}>↓ How we score this</a>
          </div>
        </div>
      </div>

      <div style={STYLES.body}>

        <section id="buy" style={{ marginBottom: '48px' }}>
          <span style={STYLES.sectionLabel}>Buy</span>
          <h2 style={STYLES.h2}>Actually buy this weekend</h2>
          <p style={STYLES.sectionBlurb}>These categories hit their year-best or near-best price window on Memorial Day. Buy with confidence.</p>
          {BUY_ITEMS.map((it, i) => (
            <div key={i} style={STYLES.itemCard}>
              <h3 style={STYLES.itemTitle}>{it.title}</h3>
              <p style={STYLES.itemBody}>{it.body}</p>
              <span style={STYLES.itemStatus}><strong>Status this week:</strong> {it.status}</span>
              {it.href && <Link href={it.href} style={STYLES.itemLink}>{it.hrefLabel} →</Link>}
            </div>
          ))}
        </section>

        <section id="wait" style={{ marginBottom: '48px' }}>
          <span style={STYLES.sectionLabel}>Wait</span>
          <h2 style={STYLES.h2}>Wait for a better window</h2>
          <p style={STYLES.sectionBlurb}>These categories are at peak price right now. Real discounts are coming — just not this weekend.</p>
          {WAIT_ITEMS.map((it, i) => (
            <div key={i} style={STYLES.itemCardWait}>
              <h3 style={STYLES.itemTitle}>{it.title}</h3>
              <p style={STYLES.itemBody}>{it.body}</p>
              <span style={STYLES.itemStatus}><strong>Status this week:</strong> {it.status}</span>
              {it.href && <Link href={it.href} style={STYLES.itemLink}>{it.hrefLabel} →</Link>}
            </div>
          ))}
        </section>

        <section id="skip" style={{ marginBottom: '48px' }}>
          <span style={STYLES.sectionLabel}>Skip</span>
          <h2 style={STYLES.h2}>Outright traps</h2>
          <p style={STYLES.sectionBlurb}>Inventory the retailer wants to clear at the price they want, dressed up with a holiday banner. Don&rsquo;t bite.</p>
          {SKIP_ITEMS.map((it, i) => (
            <div key={i} style={STYLES.itemCardSkip}>
              <h3 style={STYLES.itemTitle}>{it.title}</h3>
              <p style={STYLES.itemBody}>{it.body}</p>
            </div>
          ))}
        </section>

        <div style={STYLES.ctaBlock}>
          <h3 style={STYLES.ctaH3}>Ready to plan your weekend?</h3>
          <p style={STYLES.ctaP}>
            <strong style={{ color: '#F5EFE0' }}>Opening the lake camp or running a cookout?</strong> The Memorial Day Smart Cart gives you the lean cart for this weekend specifically — what to grab now, what looks tempting but isn&rsquo;t worth it, what to wait on. 30-day refund if it doesn&rsquo;t match your situation.
          </p>
          <Link href="/smart-cart?topic=outdoor&scope=memorial_day_weekend&utm_source=memorial_day_2026&utm_medium=cta_block" style={STYLES.ctaPrimary}>Build my Smart Cart — $19.99 →</Link>
          <Link href="/guides/lake-season-buy-skip-wait" style={STYLES.ctaSecondary}>Read the Lake Season guide</Link>
          <Link href="/chat" style={STYLES.ctaSecondary}>Ask Alder a question</Link>
        </div>

        <div id="method" style={STYLES.methodBlock}>
          <h3 style={STYLES.methodH3}>How we score this</h3>
          <p style={STYLES.methodP}>
            We track actual prices weekly at the retailers Vermont homeowners actually use: Home Depot Williston, Lowe&rsquo;s Williston, Costco, Aubuchon, r.k. Miles, Lavalleys, and online at Wayfair, Amazon, Pottery Barn, RH, Frontgate.
          </p>
          <p style={STYLES.methodP}><strong>A &ldquo;real deal&rdquo; requires three things:</strong></p>
          <ul style={STYLES.methodList}>
            <li>Price below the 90-day rolling baseline (not just below MSRP)</li>
            <li>Same SKU available at the deal price elsewhere or honored on price-match</li>
            <li>No markup-then-discount pattern in the prior 60 days</li>
          </ul>
          <p style={{ ...STYLES.methodP, marginTop: '16px' }}><strong>A &ldquo;trap&rdquo; is any of:</strong></p>
          <ul style={STYLES.methodList}>
            <li>Holiday-branded SKU with no comparable non-holiday equivalent</li>
            <li>Bundle pricing above sum-of-parts</li>
            <li>Peak seasonal demand window with no actual price movement</li>
            <li>Sub-quality product that fails in 1-2 Vermont seasons regardless of price</li>
          </ul>
          <p style={{ ...STYLES.methodP, marginTop: '16px' }}>
            The 2026 numbers above were verified the week of May 13-15. Re-checks weekly through 5/26.
          </p>
        </div>

        <div style={STYLES.vermontBlock}>
          <h3 style={STYLES.methodH3}>Vermont-specific notes</h3>
          <p style={STYLES.methodP}>
            <strong>Lake Champlain Memorial Day weekend traffic</strong> runs heavy from Charlotte to North Hero. If you&rsquo;re driving to the camp, book ferry tickets Friday morning or take the long way through Grand Isle. Williston box stores (Home Depot, Lowe&rsquo;s, Costco) are slammed Saturday — Friday afternoon or Sunday morning are the moves.
          </p>
          <p style={STYLES.methodP}>
            <strong>Vermont independents matter for some categories.</strong> Aubuchon and r.k. Miles will price-match Home Depot on bagged goods (mulch, soil, seed) and you get better staff. Lavalleys is the move for actual lumber, not the box stores.
          </p>
          <p style={STYLES.methodP}>
            <strong>Mattress delivery:</strong> every VT mattress retailer offers next-week delivery for Memorial Day orders. Don&rsquo;t pay for &ldquo;expedited&rdquo; — it&rsquo;s the same week regardless.
          </p>
        </div>

        <p style={STYLES.footnote}>
          Updated weekly. Last check: {LAST_VERIFIED}.
        </p>
      </div>
    </div>
  )
}
