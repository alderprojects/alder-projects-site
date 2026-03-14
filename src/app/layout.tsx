import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alder Projects — Vermont Construction Lead Engine',
  description: 'Connect Vermont construction projects with qualified local contractors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
