import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Vermont Window Weatherization vs Replacement: $200 vs $14K — Real Math`,
  description: `Should you weatherize or replace your old Vermont windows? Real dollar amounts, WindowDressers vs Indow vs DIY, and when to call a pro.`,
  alternates: { canonical: 'https://alderprojects.com/guides/windows-buy-skip-wait' },
  openGraph: {
    title: `Vermont Window Weatherization vs Replacement: $200 vs $14K — Real Math`,
    description: `Should you weatherize or replace your old Vermont windows? Real dollar amounts, WindowDressers vs Indow vs DIY, and when to call a pro.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/windows-buy-skip-wait',
  },
}

const content = {
  eyebrow: `Buy / Skip / Wait`,
  h1: `Windows: Buy / Skip / Wait`,
  intro: `Drafty old windows are the most common home expense decision in Vermont. The replacement quote is $14,000. The weatherization option is $200. The right answer depends on diagnostics most homeowners skip.`,
  readTime: `8 min`,
  sections: [
    {
      heading: `Before anything: find where the draft actually comes from`,
      body: `A lit incense stick or a candle on a windy day will tell you in 15 minutes what a $400 energy audit tells you in two hours. Walk every window. Find the air movement. About half the time the "draft from the window" is coming from somewhere else: rim joist below the window, casing trim, the wall outlet next to it, the attic hatch overhead. Skip every other step until you've done this one.`,
    },
    {
      heading: `Buy: the items that work for under $500 total`,
      body: `If the diagnostic confirms the windows are the source, this list handles a typical Vermont farmhouse for one to two winters. Core cart $70-115. Optional add-ons push it to $255-485.`,
      list: [
        `Weatherstripping: V-strip or silicone, not cheap foam. Foam crushes in three months. V-strip and silicone last 5-10 years. $15-35 per pack covers several windows.`,
        `Window insulator film (shrink-fit kind): $15 per kit covers 3-5 windows. Removes cleanly in spring.`,
        `Caulk and applicator: $10-20 for siliconized acrylic. Critical for window-frame-to-wall gaps.`,
        `Door-bottom sweep: $8-25. Doors are often the source of the draft blamed on windows.`,
        `Storm window insert kit (optional, ~$30-50/window): DIY version of WindowDressers, magnetic or friction-fit acrylic on the window frame.`,
      ],
    },
    {
      heading: `Skip: the moves that don't pencil out`,
      body: `These are not bad products. They're the wrong move at the wrong time for most situations.`,
      list: [
        `Skip Indow custom acrylic inserts at $300-500 per window installed (8-window farmhouse: $2,400-4,000) unless you've already done weatherstripping and film and the windows are still the problem.`,
        `Skip full window replacement before the cheap diagnostic. $800-1,500 per window installed in Vermont. For an 8-window house that's $12,000+ for a problem that might not actually be the windows.`,
        `Skip premium R-value replacement windows on a leaky house. Windows test great in lab and lose half their efficiency to air gaps around them the installer didn't seal. Spend on installation, not the unit.`,
        `Skip the "Vermont winter" upsell. Standard double-pane low-E with argon fill is enough for Vermont. Triple-pane is mostly marketing for this climate.`,
      ],
    },
    {
      heading: `Wait: the timing moves`,
      body: `If you can plan ahead, these moves save real money.`,
      list: [
        `Wait for WindowDressers if you can. Community builds, ~$40 per insert, Efficiency Vermont rebate support. Sign up in summer for November build. The best deal in Vermont window weatherization.`,
        `Wait for end-of-winter clearance on window kits. Shrink film, weatherstripping, door sweeps all drop 30-40% in March-April. Stock up for next winter.`,
        `Wait on replacement decisions until you've run a full weatherization year. If after one season of $200 in fixes the windows are still cold, replacement is the right call. If after $200 they're fine, save the $14,000.`,
      ],
    },
    {
      heading: `When to skip the cart and call a pro`,
      body: `These conditions mean weatherization isn't the right move.`,
      list: [
        `Rotted window frames (you can push a screwdriver into the wood)`,
        `Broken or stuck sashes that won't open or close properly`,
        `Failed glass seal (visible fog between panes in double-pane)`,
        `Single-pane on exposed north side of an old farmhouse where storm windows aren't an option`,
        `Frame damage from settling or impact`,
      ],
    },
  ],
  faqs: [
    {
      q: `What's the cost of full window replacement in Vermont?`,
      a: `$800-1,500 per window installed for standard double-pane, vinyl or fiberglass frames, professional installation. Add 20-40% for fiber-cement trim, wood-clad exteriors, or historic restoration. An 8-window farmhouse typically lands $8,000-16,000 all-in.`,
    },
    {
      q: `How much can weatherization save before replacement?`,
      a: `Efficiency Vermont notes drafty windows can account for 10-25% of a Vermont heating bill. Honest weatherization (V-strip + caulk + film + door sweeps) commonly cuts that draft loss by 50-70% for a season — $200-800 per winter on a typical Vermont home.`,
    },
    {
      q: `Is WindowDressers worth waiting for?`,
      a: `If you can plan 4-6 months ahead, yes. ~$40 per insert, EVT rebate support, build with neighbors. Trade-off is lead time. If you need a fix this winter and it's October, DIY storm window insert kits ($30-50/window) are the closest substitute.`,
    },
    {
      q: `Window film vs storm window inserts — what's the difference?`,
      a: `Window film (3M-style shrink-fit) is cheapest ($3-8/window) and works as a single-season fix. Storm window inserts (WindowDressers, Indow, DIY magnetic) are reusable, last years, and look better. Film is the starting point; inserts are the next step up.`,
    },
    {
      q: `Vermont-specific rebates for windows?`,
      a: `Efficiency Vermont offers incentives for ENERGY STAR-qualified window replacement, and income-eligible Vermonters can access weatherization assistance through local Community Action Partnership (CAP) agencies. Rebates can stack with federal IRA 25C credits. Call EVT before committing to any major spend.`,
    },
  ],
  ctaHeading: `Get your personalized window weatherization cart`,
  ctaBody: `$19.99. 30-day refund. Real product picks, named skip-list with dollar amounts saved, and route-out logic on when to call a pro.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=windows_bsw`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `WindowDressers vs Indow vs DIY`,
      href: `/guides/windowdressers-vs-indow-vs-diy-window-inserts-vermont`,
    },
    {
      label: `Basement: Buy / Skip / Wait`,
      href: `/guides/basement-buy-skip-wait`,
    },
    {
      label: `Vermont cost reality`,
      href: `/guides/vermont-home-project-cost-reality-2026`,
    },
    {
      label: `Cost Calculator`,
      href: `/calculator`,
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: content.faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: content.h1,
  description: `Should you weatherize or replace your old Vermont windows? Real dollar amounts, WindowDressers vs Indow vs DIY, and when to call a pro.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/windows-buy-skip-wait',
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <GuidePage content={content} smartCartCta={{ href: content.ctaHref }} />
    </>
  )
}
