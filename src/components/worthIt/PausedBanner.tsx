// V7.2.1 — paused-state banner shown on every Worth-It legacy surface
// (dashboard, find). Server-renderable, no client interactivity.

export default function PausedBanner() {
  return (
    <div className="bg-[#f5efe2] border-b border-[#e8e3d4] text-sm text-[#1a1f1a]/85 print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
        <span className="w-5 h-5 rounded-full bg-[#a44e2c] text-white inline-flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
          !
        </span>
        <span>
          Worth-It Plan is paused for new buyers while we rebuild. Your
          existing plan stays accessible. We&apos;ll email you when we ship
          the new version —{' '}
          <a className="underline" href="/worth-it">
            join the notify list
          </a>
          .
        </span>
      </div>
    </div>
  )
}
