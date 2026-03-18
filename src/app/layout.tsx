import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alder Projects \u2014 Vermont Home Renovation',
  description: 'Describe your Vermont renovation project and get connected with local contractors who match your scope, location, and timeline. Serving all 14 Vermont counties.',
  keywords: ['Vermont contractors','Vermont home renovation','Vermont remodeling','Vermont general contractor','find contractor Vermont','Burlington VT contractor','kitchen remodel Vermont'],
  openGraph: {
    title: 'Alder Projects \u2014 Vermont Home Renovation',
    description: 'Describe your project. We connect you with local Vermont contractors who are the right fit.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Projects \u2014 Vermont Home Renovation',
    description: 'Describe your project. Get connected with local Vermont contractors.',
  },
  alternates: { canonical: 'https://alderprojects.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
