// v7.2.11 — photo beta email-capture page. No promised launch date,
// no implied active feature. Email goes to /api/photo-beta-signup
// which currently logs server-side; real CRM wiring is a v7.3+ task.

import Footer from '@/components/Footer'
import PhotoBetaSignupForm from './PhotoBetaSignupForm'

export const metadata = {
  title: 'Photo beta — Alder',
  description:
    'Help us improve project recommendations by joining the photo-assisted reads beta.',
}

export default function PhotoBetaSignupPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a]">
      <header className="bg-white border-b border-[#e8e3d4]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <a href="/" className="text-[#1f3a2e] font-display text-xl">
            Alder
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        <div className="text-xs uppercase tracking-wide text-[#1f3a2e] font-medium mb-2">
          Photo beta
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-[#1a1f1a] mb-4">
          Help us see what your project actually looks like
        </h1>
        <p className="text-base text-[#1a1f1a]/85 mb-3">
          Right now Smart Cart works from your answers. Adding a photo could
          catch things words miss — drawer depth, cabinet type, plumbing
          configuration, mudroom layout — and sharpen what we recommend.
        </p>
        <p className="text-base text-[#1a1f1a]/85 mb-8">
          We&rsquo;re testing this with a small group of homeowners. No launch
          date yet. Drop your email and we&rsquo;ll reach out when there&rsquo;s
          something to try.
        </p>

        <PhotoBetaSignupForm />

        <div className="mt-10 pt-6 border-t border-[#e8e3d4] text-sm text-[#1a1f1a]/65 space-y-2">
          <p>
            <strong>Privacy:</strong> we keep your email to contact you about
            the photo beta. We won&rsquo;t share it.
          </p>
          <p>
            <strong>Honest:</strong> there is no live photo upload feature on
            the site today. This is a notification list, not a queue.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
