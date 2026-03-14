import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alder Projects — Vermont Construction Lead Engine',
  description: 'Connect your Vermont construction project with qualified local contractors. Serving all 14 Vermont counties — new homes, renovations, additions, commercial builds, roofing, and more. Free to post.',
  keywords: ['Vermont contractors','Vermont construction','Vermont home builder','Vermont renovation','Vermont general contractor','find contractor Vermont','Vermont building project'],
  openGraph: {
    title: 'Alder Projects — Vermont Construction Lead Engine',
    description: 'Find qualified Vermont contractors for your build. Free to post. All 14 counties covered.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Projects — Vermont Construction',
    description: 'Find qualified Vermont contractors for your build. Free to post.',
  },
  alternates: {
    canonical: 'https://alderprojects.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
