import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Vermont Renovation Costs 2026: Real Ranges (Not National Averages)`,
  description: `What home renovation actually costs in Vermont in 2026. Window replacement, basement, kitchen, lake setup, decks, roofing, heat pumps — real ranges from real quotes.`,
  alternates: { canonical: 'https://alderprojects.com/guides/vermont-home-project-cost-reality-2026' },
  openGraph: {
    title: `Vermont Renovation Costs 2026: Real Ranges (Not National Averages)`,
    description: `What home renovation actually costs in Vermont in 2026. Window replacement, basement, kitchen, lake setup, decks, roofing, heat pumps — real ranges from real quotes.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/vermont-home-project-cost-reality-2026',
  },
}

const content = {
  eyebrow: `Cost Reality`,
  h1: `Vermont Home Project Cost Reality 2026`,
  intro: `National cost averages are useless in Vermont. Labor rates, materials shipping, age of housing stock, seasonal contractor availability all push real costs in directions a Midwest or Southeast average won't capture. These are actual ranges from 2025-2026 Vermont quotes, by category.`,
  readTime: `8 min`,
  sections: [
    {
      heading: `Why national averages fail in Vermont`,
      body: `Three structural reasons. Vermont's housing stock skews older (median home age in many towns is 1960s-1970s, rural commonly pre-1900) — most projects involve more demolition, more code-update work, more surprises. Vermont's contractor density is low, especially outside Chittenden County, driving labor scheduling premiums and travel charges. Vermont's exterior work season is short (May-October), compressing demand and pricing.`,
    },
    {
      heading: `Window replacement: $800-1,500 per window installed`,
      body: `Standard double-pane, vinyl or fiberglass frame, professional installation. Lower end is newer homes; higher end is older homes with frame repair or trim work. Historic-restoration replacement runs $2,000-4,000 per window.`,
      list: [
        `8-window typical home replacement: $8,000-16,000`,
        `Historic farmhouse with restoration matching: $20,000-40,000+`,
        `Standard new-construction (2000s+): $6,000-12,000 for same window count`,
        `Pre-weatherization spend before deciding: $200-485 typical`,
      ],
    },
    {
      heading: `Basement finishing: $30-80 per square foot`,
      body: `A 600 sq ft basement runs $18,000-48,000 all-in for framing, insulation, drywall, flooring, basic lighting, outlets, trim. Range driven primarily by ceiling height, egress window requirements, moisture mitigation needs.`,
      list: [
        `Egress window install (often required): $2,000-5,000`,
        `Bathroom rough-in addition: $5,000-12,000`,
        `Moisture mitigation before finishing: $1,500-8,000`,
        `Diagnostic-first spend: $40 for hygrometer + moisture meter`,
      ],
    },
    {
      heading: `Kitchen renovation: $30,000-150,000`,
      body: `The widest cost range in Vermont home renovation. Drivers: cabinet quality, counter material, whether the renovation includes plumbing or electrical moves.`,
      list: [
        `Minor refresh (no cabinets, no structural): $400-1,500 DIY, $3,000-8,000 contractor`,
        `Mid-range (new cabinets, counters, appliances, no walls moved): $30,000-60,000`,
        `Full renovation (walls moved, plumbing relocated, full custom): $60,000-150,000+`,
      ],
    },
    {
      heading: `Lake season outdoor setup: $2,400-7,500`,
      body: `First-time Champlain camp or lake property setup. Range almost entirely tier choice and category coverage.`,
      list: [
        `Lean lake setup (mid-tier across): $2,400-3,800`,
        `Catalog-driven setup (designer markup throughout): $4,800-7,500`,
        `Premium custom (Treasure Garden, BGE, RH lighting): $8,000-15,000+`,
        `Memorial Day vs November buying: 30-50% price differential on furniture`,
      ],
    },
    {
      heading: `Deck building: $30-80 per square foot`,
      body: `A 200 sq ft deck runs $6,000-16,000. Drivers: material, height (over 30 inches off ground requires more structure), freestanding vs attached.`,
      list: [
        `Pressure-treated (basic): $30-40 per sq ft`,
        `Cedar (mid-range): $50-65 per sq ft`,
        `Composite (Trex, TimberTech): $60-85 per sq ft`,
        `Permitting in most VT towns: $100-500`,
      ],
    },
    {
      heading: `Roofing: $400-1,200 per square (100 sq ft)`,
      body: `A 2,000 sq ft roof (20 squares) runs $8,000-24,000.`,
      list: [
        `Architectural asphalt shingle (30-year): $400-600/square`,
        `Standing-seam metal (60+ year life): $900-1,400/square`,
        `Cedar shake: $1,200-2,000/square`,
        `Tear-off and disposal: $1,000-3,000 added`,
      ],
    },
    {
      heading: `Heat pump installation: $4,500-30,000 before rebates`,
      body: `Cold-climate heat pumps for Vermont vary widely. After Efficiency Vermont and federal 25C rebates stack, expect 20-40% off-list on qualifying installations.`,
      list: [
        `Single-zone ductless mini-split: $3,000-6,000 installed`,
        `Multi-zone whole-home (3-5 zones): $12,000-30,000`,
        `Ducted central heat pump: $8,000-18,000`,
        `EVT rebate (qualifying units): $1,000-3,000+`,
        `Federal IRA 25C credit: up to $2,000 on heat pumps`,
      ],
    },
  ],
  faqs: [
    {
      q: `Why are Vermont contractor labor rates higher?`,
      a: `Lower contractor density per capita, especially outside Chittenden County. Shorter exterior season (May-October). Higher travel time for rural sites. Differential is structural, not markup.`,
    },
    {
      q: `Cheaper to renovate in winter?`,
      a: `Interior work, sometimes — some contractors discount 5-15% for January-March schedules. Exterior work is rarely cheaper in winter because most exterior contractors don't work then.`,
    },
    {
      q: `Typical Vermont contractor deposit?`,
      a: `20-33% on signing is standard. Anything over 33% upfront is a yellow flag. Vermont law (9 V.S.A. § 4205) requires registered contractors for jobs over $10,000.`,
    },
    {
      q: `How long do Vermont renovations take?`,
      a: `Kitchen: 6-14 weeks. Bathroom: 3-6 weeks. Basement finishing: 6-10 weeks. Deck: 1-3 weeks. Roof replacement: 1-4 days. Window replacement: 1-3 days for whole-house. Heat pump install: 2-5 days. Add 4-12 weeks of lead time before start for contractor availability.`,
    },
    {
      q: `How do I verify a Vermont contractor?`,
      a: `Vermont Secretary of State professional registry at secure.professionals.vermont.gov verifies active registration (required for jobs over $10K) and shows disciplinary actions. Vermont Builders & Remodelers Association directory shows code-of-ethics members. Front Porch Forum threads often surface real customer experiences.`,
    },
  ],
  ctaHeading: `Apply this to your specific project`,
  ctaBody: `$19.99. 30-day refund. Smart Cart applies Buy / Skip / Wait with Vermont-tuned product picks and cost data.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=vt_cost`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Cost Calculator`,
      href: `/calculator`,
    },
    {
      label: `Windows: Buy / Skip / Wait`,
      href: `/guides/windows-buy-skip-wait`,
    },
    {
      label: `Basement: Buy / Skip / Wait`,
      href: `/guides/basement-buy-skip-wait`,
    },
    {
      label: `Kitchen refresh: Buy / Skip / Wait`,
      href: `/guides/kitchen-refresh-buy-skip-wait`,
    },
    {
      label: `Lake season: Buy / Skip / Wait`,
      href: `/guides/lake-season-buy-skip-wait`,
    },
    {
      label: `Buy-timing calendar`,
      href: `/guides/home-improvement-buy-timing-calendar`,
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
  description: `What home renovation actually costs in Vermont in 2026. Window replacement, basement, kitchen, lake setup, decks, roofing, heat pumps — real ranges from real quotes.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/vermont-home-project-cost-reality-2026',
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <GuidePage content={content} />
    </>
  )
}
