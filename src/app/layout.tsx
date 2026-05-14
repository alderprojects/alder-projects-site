import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import ChatBubble from '@/components/ChatBubble'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alder Projects \u2014 Vermont Homeowner Reference',
  description: 'Ask any Vermont homeowner question \u2014 heat pump rebates, kitchen costs, ADU rules, when to schedule a contractor. Real Vermont numbers from a local who knows the work.',
  openGraph: {
    title: 'Alder Projects \u2014 Vermont Homeowner Reference',
    description: 'Real Vermont renovation numbers, rebate stack, ADU rules, and contractor vetting \u2014 straight from a Vermont local. Free, no signup.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Projects \u2014 Vermont Homeowner Reference',
    description: 'Free chat for Vermont homeowners. Real renovation numbers, the 2026 rebate stack, ADU rules, and contractor vetting.',
  },
  alternates: { canonical: 'https://alderprojects.com' },
  other: {
    'impact-site-verification': '33104b35-32c8-475b-8c74-edc1681c46f2',
  },
}

// GA Measurement ID is intentionally hardcoded so it ships regardless of env var state.
// This is a public ID (visible in client HTML) — not a secret. To change it, edit this line.
const GA_ID = 'G-BH9L1VF4ZQ'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <ChatBubble />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  )
}
