import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vermont Home Renovation Guides | Alder Projects',
  description: 'Buy/Skip/Wait guides for Vermont home projects. Honest dollar amounts, designer-markup callouts, and buy-timing for windows, basements, kitchens, lake season, and more.',
  alternates: { canonical: 'https://alderprojects.com/guides' },
}

type GuideCard = { href: string; title: string; eyebrow: string; blurb: string }

const methodGuides: GuideCard[] = [
  {
    href: '/guides/how-to-shop-for-home-projects-without-overspending',
    title: 'The Buy/Skip/Wait Method',
    eyebrow: 'Start Here',
    blurb: 'How to shop for any home project without overspending. The full method with four walked examples.',
  },
  {
    href: '/guides/the-5-question-test-before-any-home-purchase',
    title: 'The 5-Question Test',
    eyebrow: 'Method',
    blurb: 'Five questions that filter any home improvement purchase. Save 20-40% on what you would have spent.',
  },
  {
    href: '/guides/home-improvement-buy-timing-calendar',
    title: 'Buy-Timing Calendar',
    eyebrow: 'Method',
    blurb: 'Month-by-month sale cycles. When each category actually goes on sale.',
  },
]

const bswGuides: GuideCard[] = [
  {
    href: '/guides/windows-buy-skip-wait',
    title: 'Windows: Buy / Skip / Wait',
    eyebrow: 'Buy/Skip/Wait',
    blurb: '$200 weatherization vs $14K replacement. WindowDressers vs Indow vs DIY. When to call a pro.',
  },
  {
    href: '/guides/basement-buy-skip-wait',
    title: 'Basement: Buy / Skip / Wait',
    eyebrow: 'Buy/Skip/Wait',
    blurb: 'The $40 diagnostic that prevents the $30,000 mistake. Moisture before finishing.',
  },
  {
    href: '/guides/lake-season-buy-skip-wait',
    title: 'Lake Season: Buy / Skip / Wait',
    eyebrow: 'Buy/Skip/Wait',
    blurb: '$2,400 lean vs $7,500 catalog. The designer-markup map for outdoor setup.',
  },
  {
    href: '/guides/kitchen-refresh-buy-skip-wait',
    title: 'Kitchen Refresh: Buy / Skip / Wait',
    eyebrow: 'Buy/Skip/Wait',
    blurb: 'How $2,000 of shopping becomes $480 (and looks better). Cabinet hardware, faucets, lighting.',
  },
]

const compareGuides: GuideCard[] = [
  {
    href: '/guides/windowdressers-vs-indow-vs-diy-window-inserts-vermont',
    title: 'WindowDressers vs Indow vs DIY',
    eyebrow: 'Comparison',
    blurb: 'Three-way comparison of Vermont window insert options. Prices, lead times, who installs.',
  },
  {
    href: '/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights',
    title: 'Brightech vs Pottery Barn vs RH String Lights',
    eyebrow: 'Comparison',
    blurb: 'Are designer outdoor string lights worth 3x the price? Spec comparison and honest verdict.',
  },
  {
    href: '/guides/polywood-vs-highwood-vs-frontgate-adirondack-chairs',
    title: 'Polywood vs Highwood vs Frontgate',
    eyebrow: 'Comparison',
    blurb: 'Recycled HDPE Adirondack chairs across three tiers. Material specs, 10-year cost.',
  },
  {
    href: '/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost',
    title: 'Weber vs BGE vs Kamado Joe',
    eyebrow: 'Comparison',
    blurb: 'Is BGE worth $2,500? Cook quality by food type, 5-year TCO, who should buy what.',
  },
  {
    href: '/guides/cabinet-pulls-designer-vs-mid-tier-real-difference',
    title: 'Cabinet Pulls: Designer vs Mid-Tier',
    eyebrow: 'Comparison',
    blurb: 'Are $40 designer pulls actually better than $5 mid-tier? Material reality and the 25-pull math.',
  },
]

const vtBestOf: GuideCard[] = [
  {
    href: '/guides/best-hardware-stores-in-vermont',
    title: 'Best Hardware Stores in Vermont',
    eyebrow: 'Vermont Best Of',
    blurb: 'Aubuchon, r.k. Miles, Lavalleys, Allen, and the independents that beat the big-box experience.',
  },
  {
    href: '/guides/best-paint-stores-in-vermont',
    title: 'Best Paint Stores in Vermont',
    eyebrow: 'Vermont Best Of',
    blurb: 'Sherwin-Williams, Benjamin Moore dealers, and the staff that make a paint store worth visiting.',
  },
  {
    href: '/guides/best-lumber-yards-in-vermont',
    title: 'Best Lumber Yards in Vermont',
    eyebrow: 'Vermont Best Of',
    blurb: 'Where Vermont contractors and serious DIYers actually buy lumber. Regional yards by area.',
  },
]

const costGuides: GuideCard[] = [
  {
    href: '/guides/vermont-home-project-cost-reality-2026',
    title: 'Vermont Renovation Cost Reality 2026',
    eyebrow: 'Cost Guide',
    blurb: 'Real ranges from real quotes — windows, basement, kitchen, lake, decks, roofing, heat pumps.',
  },
  {
    href: '/calculator',
    title: 'Vermont Renovation Cost Calculator',
    eyebrow: 'Interactive Tool',
    blurb: 'Get an estimate for your project. 8 project types, location multipliers, contingency slider.',
  },
]

const existingContractorGuides: GuideCard[] = [
  {
    href: '/guides/how-much-does-kitchen-remodel-cost-vermont',
    title: 'How Much Does a Kitchen Remodel Cost in Vermont?',
    eyebrow: 'Cost Guide',
    blurb: 'Vermont kitchen remodel costs broken down by scope.',
  },
  {
    href: '/guides/how-to-find-contractor-vermont',
    title: 'How to Find a Contractor in Vermont',
    eyebrow: 'Hiring Guide',
    blurb: 'Verification, vetting, and what to ask before signing.',
  },
  {
    href: '/guides/vermont-renovation-permit-guide',
    title: 'Vermont Renovation Permit Guide',
    eyebrow: 'Reference',
    blurb: 'What needs a permit, who pulls it, and how long it takes.',
  },
  {
    href: '/guides/what-to-ask-contractor-before-hiring',
    title: 'What to Ask a Contractor Before Hiring',
    eyebrow: 'Hiring Guide',
    blurb: 'The pre-hire checklist that protects you.',
  },
  {
    href: '/guides/how-long-does-bathroom-remodel-take-vermont',
    title: 'How Long Does a Bathroom Remodel Take?',
    eyebrow: 'Timeline',
    blurb: 'Realistic Vermont bathroom remodel timelines by scope.',
  },
]

function CardGrid({ guides }: { guides: GuideCard[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
      {guides.map((g) => (
        <Link
          key={g.href}
          href={g.href}
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid rgba(28,43,26,0.1)',
            borderRadius: '4px',
            textDecoration: 'none',
            transition: 'border-color 0.15s ease',
          }}
        >
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '8px' }}>{g.eyebrow}</span>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '17px', fontWeight: 600, color: '#1C2B1A', marginBottom: '8px', lineHeight: 1.3 }}>{g.title}</h3>
          <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.55, margin: 0 }}>{g.blurb}</p>
        </Link>
      ))}
    </div>
  )
}

export default function GuidesIndex() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      <header style={{ backgroundColor: '#0D1A0B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/calculator" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.5)', textDecoration: 'none' }}>Cost Calculator</Link>
          <Link href="/smart-cart" style={{ padding: '7px 16px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '12px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' }}>Smart Cart $19.99</Link>
        </div>
      </header>

      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,64px) 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '10px' }}>Guides</span>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.15, marginBottom: '14px' }}>Vermont home projects, honestly.</h1>
          <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, margin: 0, maxWidth: '600px' }}>Buy/Skip/Wait guides with real dollar amounts and named designer-markup patterns. Built around Smart Cart, free to read. Get the personalized version for $19.99.</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(32px,5vw,56px) 24px 80px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>The Method</h2>
        <CardGrid guides={methodGuides} />

        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>Buy / Skip / Wait by Project</h2>
        <CardGrid guides={bswGuides} />

        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>Comparisons</h2>
        <CardGrid guides={compareGuides} />

        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>Vermont Best Of</h2>
        <CardGrid guides={vtBestOf} />

        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>Cost & Calculator</h2>
        <CardGrid guides={costGuides} />

        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>Hiring Vermont Contractors</h2>
        <CardGrid guides={existingContractorGuides} />
      </div>
    </div>
  )
}
