import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import SignOutButton from './_components/SignOutButton'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/account/sign-in')
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-medium text-gray-900">Your account</h1>
      <p className="mb-8 text-sm text-gray-600">
        Signed in as <span className="font-mono text-gray-900">{user.email}</span>
      </p>

      <div className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-medium text-gray-900">Read v1 (week 1)</h2>
          <p className="text-sm text-gray-600">
            Auth is wired. Photos, projects, and outcome capture land in the coming weeks.
          </p>
        </section>

        <SignOutButton />
      </div>
    </main>
  )
}
