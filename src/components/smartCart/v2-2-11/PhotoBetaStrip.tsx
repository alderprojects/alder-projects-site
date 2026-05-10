'use client'

// v7.2.11 — subtle photo-beta strip. NOT a fake upload button.
// Honest framing: photo-assisted reads are coming, signup is for
// notification only.

import { trackResultPageEvent } from '@/lib/analytics'

export default function PhotoBetaStrip() {
  return (
    <aside className="border border-dashed border-[#e8e3d4] rounded-lg px-4 py-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white">
      <div className="flex-1 text-sm text-[#1a1f1a]/85">
        <strong className="text-[#1a1f1a]">Photo-assisted reads are coming next.</strong>{' '}
        Add a quick photo later to sharpen recommendations and catch what your answers may miss.
      </div>
      <a
        href="/photo-beta-signup"
        onClick={() => trackResultPageEvent('photo_beta_click')}
        className="text-sm text-[#1f3a2e] font-medium px-4 py-2 rounded-lg border border-[#e8e3d4] hover:bg-[#f5efe2] whitespace-nowrap"
      >
        Join photo beta →
      </a>
    </aside>
  )
}
