import type { Metadata } from 'next'
import Link from 'next/link'
import MemorialDayActionCard from '@/components/MemorialDayActionCard'
import { REFUND_POLICY_SHORT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Memorial Day 2026: What to Skip + What to Actually Buy (Vermont)',
  description: 'Patio furniture is at peak price. Designer outdoor decor is marked up. Premium grills do not discount yet. Here is what to actually buy this Memorial Day in Vermont — and what to skip.',
  alternates: { canonical: 'https://alderprojects.com/guides/memorial-day-2026-what-to-skip-vermont' },
  openGraph: {
    title: 'Memorial Day 2026: What to Skip (Vermont)',
    description: 'Skip list with dollar amounts. Built in Vermont. $19.99 personalized version.',
    type: 'article',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is patio furniture really cheaper later in the year?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Outdoor furniture drops 30-50% from November through February as retailers clear inventory. May-June is peak demand pricing. The "Memorial Day sale" prices are usually 20-30% higher than off-season.' } },
    { '@type': 'Question', name: 'What IS actually a Memorial Day deal?', acceptedAnswer: { '@type': 'Answer', text: 'Mattresses (genuine year-best window before Labor Day), major appliances (last-year model clearance), mid-range grills (Weber Spirit tier — real Memorial Day promo prices), and mulch/basic landscape supplies (loss leaders to drive store traffic).' } },
    { '@type': 'Question', name: 'Are premium grills like Big Green Egg discounted at Memorial Day?', acceptedAnswer: { '@type': 'Answer', text: 'Rarely. BGE, Kamado Joe, and other premium ceramic grills do not hit their real promo cycle until late July through August, with 15-25% off. Mid-range grills (Weber Spirit, Char-Broil) are the only tier with genuine Memorial Day promos.' } },
    { '@type': 'Question', name: 'What if I genuinely need patio furniture this weekend?', acceptedAnswer: { '@type': 'Answer', text: 'Three options that beat Memorial Day big-box prices: end-of-season clearance at independent Vermont garden centers (last year inventory), floor models at any big box (most will discount 25-40% if you ask), or Facebook Marketplace where supply spikes in May as people upgrade.' } },
    { '@type': 'Question', name: 'What does the $19.99 Smart Cart actually include?', acceptedAnswer: { '@type': 'Answer', text: 'A personalized buy/skip/wait list for your specific Memorial Day project — exact products with prices by tier, the skip list with dollar amounts saved per skip, and the wait list with the month each item drops. 30-day refund — reply "refund" to the receipt.' } },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
        <div style={{ backgroundColor: '#0D1A0B', padding: 'clamp(40px,6vw,64px) 24px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '12px' }}>
              Memorial Day 2026 · 4 min read
            </span>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.15, marginBottom: '16px' }}>
              What to skip this Memorial Day weekend
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.7)', lineHeight: 1.7, margin: 0 }}>
              Every retailer is screaming "BUY." Most of what they are pushing is at peak price right now. Here is what is genuinely worth buying this weekend, what to skip, and what to wait on.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 64px' }}>
          <MemorialDayActionCard />

          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginTop: '40px', marginBottom: '16px' }}>The four skips that save the most</h2>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#C8732A', margin: '0 0 8px 0' }}>1. Patio furniture. Save $300–1,200.</h3>
            <p style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.65, margin: '0 0 8px 0' }}>
              Outdoor furniture drops 30–50% from November through February. May–June is peak demand pricing. The same 4-piece wicker set listed at $899 in May is $499 in December at the same retailer. The aluminum dining table at $549 in June is $329 in January. Memorial Day "sale" prices are usually 20–30% above off-season.
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.6)', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
              If you need it now: independent garden center clearance, floor models (ask for 25–40% off), Facebook Marketplace (supply spikes in May).
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#C8732A', margin: '0 0 8px 0' }}>2. Designer outdoor decor and lighting. Save $200–500.</h3>
            <p style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.65, margin: '0 0 8px 0' }}>
              Pottery Barn outdoor string lights at $250 perform the same as Brightech at $60. Frontgate cushions at $300 use the same Sunbrella fabric as $80 mid-tier cushions. The premium goes to packaging, marketing, and brand. Functional performance is comparable.
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.6)', lineHeight: 1.55, margin: 0 }}>
              <Link href="/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights" style={{ color: '#C8732A' }}>Brightech vs Pottery Barn comparison →</Link>
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#C8732A', margin: '0 0 8px 0' }}>3. Premium grills. Wait until late July. Save $200–600.</h3>
            <p style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.65, margin: '0 0 8px 0' }}>
              Big Green Egg, Kamado Joe, and other premium ceramic grills do not hit their real promo cycle until late July–August (15–25% off). Mid-range grills (Weber Spirit, Char-Broil) are the only tier with genuine Memorial Day promos. If you need a grill this weekend and your cooking is burgers/chicken/occasional steak, Weber Spirit at full retail beats BGE at full retail every time on dollar-per-cook.
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.6)', lineHeight: 1.55, margin: 0 }}>
              <Link href="/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost" style={{ color: '#C8732A' }}>Weber vs BGE vs Kamado Joe real-cost comparison →</Link>
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#C8732A', margin: '0 0 8px 0' }}>4. "Memorial Day branded" anything. Save $50–150.</h3>
            <p style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.65, margin: 0 }}>
              Memorial Day signs, themed pillows, holiday-specific decor. These items look dated in 18 months and the next owner of your property throws them out. If you actually want patriotic decor, buy the basics (a real flag, a flag pole holder) and skip the seasonal markup.
            </p>
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginTop: '40px', marginBottom: '16px' }}>What IS actually a Memorial Day deal</h2>

          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>Mattresses.</strong> Genuine year-best window before Labor Day. 30–50% off last-year models.
            </li>
            <li style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>Major appliances.</strong> Last-year washer, dryer, fridge, dishwasher models clear as new lines launch.
            </li>
            <li style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>Mid-range grills.</strong> Weber Spirit, Char-Broil tier — real promo prices. Premium grills wait.
            </li>
            <li style={{ fontSize: '15px', color: 'rgba(28,43,26,0.78)', lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>Mulch, garden soil, basic landscape supplies.</strong> Loss leaders at hardware stores. Buy what you need this week.
            </li>
          </ul>

          <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#1C2B1A', borderRadius: '4px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 600, color: '#F5EFE0', margin: '0 0 10px 0' }}>
              Get the personalized version
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(245,239,224,0.75)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Smart Cart builds a buy/skip/wait list for your specific Memorial Day project — exact products with prices, dollar amounts saved per skip, and buy-timing for each item.
            </p>
            <Link
              href="/smart-cart?topic=outdoor&scope=memorial_day_weekend&utm_source=guide&utm_medium=article&utm_campaign=md_skip_bottom"
              style={{ display: 'inline-block', padding: '12px 22px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '14px', fontWeight: 600, borderRadius: '3px', textDecoration: 'none' }}
            >
              Build my Memorial Day Smart Cart — $19.99 →
            </Link>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.45)', marginTop: '10px', marginBottom: 0 }}>
              {REFUND_POLICY_SHORT} · No form
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
