/**
 * v7.4.5 — Admin console shell + the real authorization check.
 *
 * Everything inside the (console) route group renders only for a
 * signed-in User whose email is on the ADMIN_EMAILS allowlist. The
 * middleware already bounced cookie-less requests to /admin/login;
 * here the session is resolved against the DB and the allowlist is
 * enforced. Non-allowlisted sign-ins get the 403 page (and checkAdmin
 * has already written the DENIED AdminAccessLog row).
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkAdmin } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Alder admin', robots: { index: false } }

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const check = await checkAdmin()
  if (check.status === 'unauthenticated') redirect('/admin/login')

  if (check.status === 'forbidden') {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '80px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>403 — not an admin account</h1>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
          You&apos;re signed in as <code>{check.email}</code>, which isn&apos;t on the admin
          allowlist. This attempt has been logged.
        </p>
        <p style={{ fontSize: 14 }}>
          <Link href="/">← back to the site</Link>
        </p>
      </main>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#fafaf7' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '10px 24px',
          borderBottom: '1px solid #ddd',
          background: '#fff',
          fontSize: 14,
        }}
      >
        <span style={{ fontWeight: 600 }}>Alder admin</span>
        <nav style={{ display: 'flex', gap: 14 }}>
          <Link href="/admin" style={{ color: '#1d4ed8', textDecoration: 'none' }}>
            Sessions
          </Link>
          <Link href="/admin/reports" style={{ color: '#1d4ed8', textDecoration: 'none' }}>
            Reports (lite)
          </Link>
        </nav>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12.5 }}>{check.user.email}</span>
      </header>
      {children}
    </div>
  )
}
