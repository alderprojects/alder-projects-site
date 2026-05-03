import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import {
  buildArticle,
  buildBreadcrumbList,
  buildFaqPage,
  absUrl,
} from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Vermont Mud Season Survival Guide for Homeowners (2026)',
  description: 'Real Vermont mud season tactics for homeowners — driveway protection, mudroom setup, contractor scheduling windows, and what to actually buy. From a Vermont local.',
  alternates: { canonical: 'https://alderprojects.com/vermont-mud-season-homeowner-guide' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Vermont Mud Season: A Real Homeowner Guide',
    description: 'Driveway protection, mudroom setup, contractor scheduling, and the gear that actually works. Vermont specifics, no national fluff.',
    url: 'https://alderprojects.com/vermont-mud-season-homeowner-guide',
    type: 'article',
  },
}

const AMZ = (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=alderprojects-20`

const MUD_SEASON_PATH = '/vermont-mud-season-homeowner-guide'
const MUD_SEASON_VERIFY_DATE = '2026-05-03'

const MUD_SEASON_FAQS = [
  { q: 'How long does Vermont mud season last?', a: 'Roughly mid-March to early May, with northern and higher-elevation properties running 1-3 weeks behind the southern lowlands. The end correlates with the last hard frost — typically the 2nd-3rd week of May in most of Vermont.' },
  { q: 'Should I avoid moving to Vermont in mud season?', a: 'If you have a choice, schedule your move for June or late September. Mud season makes truck deliveries to a new property genuinely difficult. Class 4 road properties are effectively unreachable.' },
  { q: 'Can I do exterior renovation work during mud season?', a: 'Almost none. Painting, roofing, deck building, excavation, and foundation work are all blocked by saturated soil and weight limits. Push exterior work to mid-May. Interior work is fair game.' },
  { q: 'Are there mud season weight limits on Vermont roads?', a: 'Yes. Most Vermont towns post weight limits (6-ton or 12-ton typical) on dirt and gravel roads from late March through early May. Posted limits affect oil delivery, propane, gravel, and heavy contractor trucks.' },
  { q: 'Why is my driveway always rutted after mud season?', a: "Almost always because the underlying base is too thin or poorly drained. A properly built Vermont driveway has 6-8 inches of crushed gravel over a free-draining base. A one-time investment in proper drainage and geotextile fabric ($3-5k typical) pays back in 4-5 saved regrades." },
]

const mudSeasonSchemas = [
  buildArticle({
    headline: 'Vermont mud season: a real homeowner guide',
    description: 'Driveway protection, mudroom setup, contractor scheduling, and the gear that actually works. Vermont specifics, no national fluff.',
    url: absUrl(MUD_SEASON_PATH),
    dateModified: MUD_SEASON_VERIFY_DATE,
  }),
  buildBreadcrumbList([
    { name: 'Home', url: '/' },
    { name: 'Vermont mud season guide', url: MUD_SEASON_PATH },
  ]),
  buildFaqPage(
    MUD_SEASON_FAQS.map(f => ({ question: f.q, answer: f.a })),
  ),
]

export default function MudSeasonPage() {
  return (
    <>
      {mudSeasonSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#1a1a1a', lineHeight: 1.65, fontSize: 17 }}>

        <p style={{ color: '#7a7568', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Vermont Homeowner Guide</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Vermont mud season: a real homeowner guide</h1>
        <p style={{ color: '#5a5650', fontSize: 18, marginBottom: 32 }}>
          Mid-March through early May. Your driveway dissolves, your mudroom turns brown, and contractors stop returning calls. Here{'’'}s what actually works in Vermont — not a generic mud-mat listicle.
        </p>

        <p style={{ fontSize: 14, color: '#7a7568', borderLeft: '3px solid #d4cfc4', paddingLeft: 16, marginBottom: 40 }}>
          Some product links below earn us a small commission if you buy. We only recommend what we{'’'}d use ourselves on a Vermont property. <a href="/disclosure" style={{ color: '#7A9B6F' }}>How we make money</a>.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>What mud season actually is</h2>
        <p>
          Vermont mud season is the period between when the frost starts coming out of the ground and when the ground fully dries out. Roughly mid-March to early May depending on elevation and exposure, with northern and higher-elevation properties trailing the southern lowlands by 1-3 weeks.
        </p>
        <p>
          The frost in Vermont soil typically goes 2-4 feet deep by late February. As that frost retreats from the surface downward, the top layer thaws but can{'’'}t drain because there{'’'}s still frozen ground underneath. The top 6-12 inches of soil turns into the consistency of wet cake batter. Trucks sink. Driveways rut. Lawns get destroyed by anyone walking on them.
        </p>
        <p>
          The misery of mud season is not new mud. It{'’'}s the impossibility of doing anything outside until June. Plan accordingly.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>The driveway problem</h2>
        <p>
          If you have a dirt or gravel driveway in Vermont, mud season is when you find out whether it was built right. A properly built driveway has 6-8 inches of well-graded gravel on top of a free-draining base, with crowned profile and drainage on both sides. Most don{'’'}t. The shortcut driveways that get installed for $3,000-5,000 turn into ruts every spring.
        </p>
        <p><strong>What works during the season:</strong></p>
        <ul style={{ paddingLeft: 24 }}>
          <li><strong>Don{'’'}t drive on the worst spots when you can avoid it.</strong> Park near the road and walk in if your driveway has soft sections. Every truck pass during peak mud deepens a rut that you{'’'}ll pay to regrade in May.</li>
          <li><strong>Lay down boards or plywood for foot traffic</strong> from the driveway to the house if your walkway is mush. <a href={AMZ('rubber stable mats heavy duty 4x6')} target="_blank" rel="noopener nofollow sponsored">Heavy rubber stable mats</a> work better than plywood and last for years.</li>
          <li><strong>Stake the soft edges</strong> with t-posts and rope to keep delivery drivers and visitors from cutting corners and turning your lawn into ruts.</li>
        </ul>
        <p><strong>What works post-season (May/June):</strong></p>
        <ul style={{ paddingLeft: 24 }}>
          <li>Regrade and add gravel. Vermont 1.5-inch crushed stone (sometimes called "3/4 minus" or "dense graded") is what most VT driveways need. A typical 100-foot driveway needs 8-15 yards of new gravel — about $400-900 delivered in 2026.</li>
          <li>If you have the same problem every year, the underlying base is wrong. Consider a one-time $3-5k investment in proper drainage and a 4-inch geotextile fabric layer beneath new gravel — pays for itself in 4-5 mud seasons.</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>The mudroom (or improvised entry)</h2>
        <p>
          If your house has an actual mudroom, this is the season it earns its keep. If it doesn{'’'}t, you{'’'}re going to track Vermont topsoil through your kitchen for six weeks.
        </p>
        <p><strong>The setup that actually works:</strong></p>
        <ul style={{ paddingLeft: 24 }}>
          <li><strong>Boot tray with a lip</strong> that captures runoff. The flat ones look nice and accomplish nothing. <a href={AMZ('large boot tray with lip rubber')} target="_blank" rel="noopener nofollow sponsored">A 30-inch high-side rubber tray</a> handles a family{'’'}s worth of mud boots.</li>
          <li><strong>Coir doormat outside, rubber-backed mat inside.</strong> Two-mat system. Coir scrapes the chunks; the inside mat catches the fines. <a href={AMZ('heavy coir door mat outdoor')} target="_blank" rel="noopener nofollow sponsored">A thick coir mat</a> outlasts the cheap ones two-to-one.</li>
          <li><strong>Boot scraper mounted to the porch.</strong> The cast-iron <a href={AMZ('cast iron boot scraper outdoor')} target="_blank" rel="noopener nofollow sponsored">brush-and-scrape boot scraper</a> screws to your deck and removes 80% of the mud before boots come off. Old technology, still the right answer.</li>
          <li><strong>Hooks at boot height for wet pants.</strong> Mud-spattered pants need somewhere to drip dry where they don{'’'}t hit the wall.</li>
        </ul>
        <p>
          If you don{'’'}t have a mudroom, set up a temporary one in your garage or entry area for the season — boot tray, mat, hooks, towel rack. Take it down in June. Beats a permanent kitchen-floor disaster.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>The dog problem</h2>
        <p>
          If you have a dog in Vermont, mud season has a name and it{'’'}s your dog. A 50-pound retriever can carry roughly 2 pounds of mud back into the house per outing. Solutions:
        </p>
        <ul style={{ paddingLeft: 24 }}>
          <li><a href={AMZ('dog paw washer cleaner cup')} target="_blank" rel="noopener nofollow sponsored">A paw-washer cup</a> by the back door. Fill with warm water, dunk one paw at a time, towel off. Saves your floors.</li>
          <li><a href={AMZ('absorbent dog drying towel microfiber')} target="_blank" rel="noopener nofollow sponsored">A dedicated drying towel</a> at the entry — microfiber pulls moisture faster than a regular bath towel.</li>
          <li><strong>Don{'’'}t bother with dog booties.</strong> They fall off in mud, every dog owner in Vermont has tried, every dog owner has given up.</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>Why your contractor stopped calling you back</h2>
        <p>
          Vermont contractors hate mud season more than you do. They can{'’'}t bring a heavy truck up your driveway, can{'’'}t excavate without making a worse mess, and any exterior work gets rained on every other day. April-May is the slowest contractor month of the year.
        </p>
        <p>
          If you have a renovation planned, schedule it for either early March (before the thaw, contractors are taking calls) or June (after the ground dries, they{'’'}re ramping up). The window between is dead.
        </p>
        <p>
          If you{'’'}re trying to plan an exterior project — roofing, siding, deck, painting — the realistic Vermont schedule is bid in March, sign in early April, work starts mid-May to mid-June. Contractors who promise April starts are either small one-person crews or are about to disappoint you. Both are red flags.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>What you can actually get done in mud season</h2>
        <p>Plenty, if you focus indoors:</p>
        <ul style={{ paddingLeft: 24 }}>
          <li><strong>Energy audits.</strong> April is the EVT auditor sweet spot — they{'’'}ve got availability and the indoor work isn{'’'}t weather-dependent. Free through Efficiency Vermont. Schedule a Vermont energy audit now and you{'’'}re positioned to capture summer weatherization rebates.</li>
          <li><strong>Interior renovation work</strong> — kitchen, bath, basement, paint, flooring. All weather-independent.</li>
          <li><strong>Permit applications.</strong> If you{'’'}re planning a summer build, file zoning and building permits in mud season. Town offices are quieter, review is faster, and you{'’'}ll be cleared by the time ground dries.</li>
          <li><strong>Contractor bidding.</strong> Bid your summer work now. Contractors will bid more carefully in mud season than in their July rush, and you{'’'}ll have leverage.</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>The Vermont-specific rules</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li><strong>Class 4 roads</strong> — many Vermont towns have unmaintained Class 4 roads that go effectively impassable in mud season. If you{'’'}re looking at property that requires Class 4 access, the answer to "can I get there year-round?" is no.</li>
          <li><strong>Ag exemption laws</strong> — town road postings (weight limits) take effect during mud season to protect the gravel base. Most VT towns post 6-ton or 12-ton limits in late March. Heavy delivery trucks (oil, propane, gravel) can{'’'}t come up posted roads. Stock your tank in February.</li>
          <li><strong>Septic systems</strong> — saturated ground in mud season can mean septic backups if your leach field is undersized. If you smell anything, call a septic pumper before it becomes a $5,000 problem. <a href="/guides/vermont-septic-what-to-know" style={{ color: '#7A9B6F' }}>Read the Vermont septic guide</a>.</li>
          <li><strong>EVT energy audits</strong> — mud season is the perfect window. <a href="/guides/vermont-weatherization-evt-rebate" style={{ color: '#7A9B6F' }}>How the EVT 75-90% weatherization rebate works</a> and what to schedule before summer demand hits.</li>
          <li><strong>Northeast Kingdom rural reality</strong> — mud season runs longest in the NEK. <a href="/st-johnsbury-vt" style={{ color: '#7A9B6F' }}>St. Johnsbury contractor density notes</a> and how to plan around it.</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>The mud-season shopping list</h2>
        <p>The whole list in one place. None of this is luxury — it{'’'}s the gear that turns mud season from misery into manageable.</p>
        <ul style={{ paddingLeft: 24 }}>
          <li><a href={AMZ('rubber stable mats heavy duty 4x6')} target="_blank" rel="noopener nofollow sponsored">Heavy rubber stable mats</a> — driveway-to-walkway boards that last for years</li>
          <li><a href={AMZ('large boot tray with lip rubber')} target="_blank" rel="noopener nofollow sponsored">Boot tray with high lip</a> — captures runoff in your entry</li>
          <li><a href={AMZ('heavy coir door mat outdoor')} target="_blank" rel="noopener nofollow sponsored">Heavy coir doormat</a> — outdoor scraping</li>
          <li><a href={AMZ('cast iron boot scraper outdoor')} target="_blank" rel="noopener nofollow sponsored">Cast iron boot scraper</a> — old reliable, screws to deck</li>
          <li><a href={AMZ('dog paw washer cleaner cup')} target="_blank" rel="noopener nofollow sponsored">Dog paw washer cup</a> — if you have a dog</li>
          <li><a href={AMZ('absorbent dog drying towel microfiber')} target="_blank" rel="noopener nofollow sponsored">Microfiber drying towel for dogs</a> — pulls moisture fast</li>
          <li><a href={AMZ('mud season driveway gravel netting')} target="_blank" rel="noopener nofollow sponsored">Driveway grid stabilizer</a> — for the chronically rutted spots, optional</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>Frequently asked</h2>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>How long does Vermont mud season last?</h3>
        <p>Roughly mid-March to early May, with northern and higher-elevation properties running 1-3 weeks behind the southern lowlands. The end of mud season correlates with the last hard frost — typically the 2nd-3rd week of May in most of Vermont.</p>

        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Should I avoid moving to Vermont in mud season?</h3>
        <p>If you have a choice, schedule your move for June or late September. Mud season makes truck deliveries to your new property genuinely difficult. Class 4 road properties are effectively unreachable.</p>

        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Can I do exterior renovation work during mud season?</h3>
        <p>Almost no. Painting (too wet), roofing (too wet), deck building (ground too soft for materials staging), excavation (creates worse messes), foundation work (saturated soil moves). Push exterior to mid-May at earliest. Interior work is fair game.</p>

        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Are there mud season weight limits on Vermont roads?</h3>
        <p>Yes. Most Vermont towns post weight limits (6-ton or 12-ton typical) on dirt and gravel roads from late March through early May to protect the gravel base. Posted limits affect oil delivery, propane, gravel, and heavy contractor trucks. Plan your fuel and material deliveries before posting.</p>

        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Why is my driveway always rutted after mud season?</h3>
        <p>Almost always because the underlying base is too thin or poorly drained. A properly built Vermont driveway has 6-8 inches of crushed gravel over a free-draining base, with drainage on both sides. If yours doesn{'’'}t, you{'’'}ll re-rut every year. A one-time investment in proper drainage and geotextile fabric ($3-5k for a typical driveway) pays back in 4-5 saved regrades.</p>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>Got a Vermont property question?</h2>
        <p>
          We answer Vermont homeowner questions for free — costs, rebates, contractor vetting, the actual order to do things in. <a href="/chat" style={{ color: '#7A9B6F', fontWeight: 600 }}>Ask the chat assistant →</a>
        </p>

        {/* V5 funnel CTA — pushes article readers back to the
            address-specific property tool. */}
        <div
          style={{
            marginTop: 40,
            padding: 24,
            background: '#fff',
            border: '1px solid rgba(28,43,26,0.1)',
            borderRadius: 4,
          }}
        >
          <p style={{ fontSize: 15, color: 'rgba(28,43,26,0.7)', lineHeight: 1.55, margin: '0 0 12px' }}>
            Mud season is one piece. For the full Vermont property picture by your address:
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              fontSize: 14,
              fontWeight: 600,
              color: '#C8732A',
              textDecoration: 'none',
            }}
          >
            Enter your address →
          </a>
        </div>

      </main>
      <Footer />
    </>
  )
}
