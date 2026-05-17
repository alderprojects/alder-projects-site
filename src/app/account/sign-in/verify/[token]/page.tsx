import { redirect } from 'next/navigation'
import { consumeMagicLink } from '@/lib/auth/magic-link'
import { mintSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

// /account/sign-in/verify/[token]
// User lands here from the magic-link email. We consume the token, mint
// a session cookie, and redirect to /account. Any failure renders a
// friendly explanation with a link back to /account/sign-in.

interface PageProps {
  params: { token: string }
}

export default async function VerifyPage({ params }: PageProps) {
  const { token } = params

  const result = await consumeMagicLink(token)
  if (!result.ok || !result.userId) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 text-2xl font-medium text-gray-900">Link didn’t work</h1>
        <p className="mb-6 text-sm text-gray-700">{explainReason(result.reason)}</p>
        <a
          href="/account/sign-in"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Request a new link
        </a>
      </main>
    )
  }

  await mintSession(result.userId)
  redirect('/account')
}

function explainReason(reason: string | undefined): string {
  switch (reason) {
    case 'expired':
      return 'This sign-in link has expired (links are valid for 15 minutes). Request a new one and try again.'
    case 'already_consumed':
      return 'This link was already used. For your security, each link works only once.'
    case 'not_found':
      return 'We couldn’t find that sign-in link. It may have been mistyped or already used.'
    default:
      return 'We couldn’t complete sign-in. Request a new link and try again.'
  }
}
