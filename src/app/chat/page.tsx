import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'Ask a Vermont Local — Renovation Costs, Rebates, ADUs · Alder Projects',
  description:
    'Free chat for Vermont homeowners. Renovation costs by town, the 2026 rebate stack, ADU rules, septic timing, contractor vetting. Real VT numbers, not national averages.',
  alternates: { canonical: 'https://alderprojects.com/chat' },
}

export default function ChatPage() {
  return (
    <div style={{ backgroundColor: '#fdfcf9', minHeight: '100vh' }}>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1
            className="text-3xl mb-2"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            Vermont Homeowner Assistant
          </h1>
          <p
            className="text-base"
            style={{ fontFamily: 'DM Sans, system-ui, sans-serif', color: '#5a554a' }}
          >
            Ask whatever you want about heat pumps, weatherization, and the Vermont rebate
            stack. I'll give you Vermont-specific numbers and tell you the order of operations
            most homeowners get wrong.
          </p>
          <p
            className="text-sm mt-3"
            style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              color: '#7a7568',
              fontStyle: 'italic',
            }}
          >
            For kitchen, bathroom, deck, or other renovation cost questions, the{' '}
            <a href="/calculator" style={{ color: '#2c4a3e', textDecoration: 'underline' }}>
              cost calculator
            </a>{' '}
            has Vermont-specific ranges.
          </p>
        </header>

        <ChatWidget source="chat_page" variant="page" />

        <footer
          className="mt-8 pt-6 border-t text-xs"
          style={{
            borderColor: '#e5e0d4',
            color: '#7a7568',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          }}
        >
          <p className="mb-2">
            Rebate amounts current as of 2026. State and utility programs change quarterly. We
            try to stay current; the installer who quotes you confirms eligibility when they
            file.
          </p>
          <p>
            Federal Section 25C tax credit expired December 31, 2025. State (Efficiency
            Vermont) and utility (GMP, VPPSA, BED, VGS) rebates are the only stack now.
          </p>
        </footer>
      </main>
    </div>
  )
}
