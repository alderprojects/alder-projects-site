'use client'
import Link from 'next/link'
export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1C2B1A]/95 backdrop-blur-sm py-3">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/><path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/></svg>
          <span className="font-display text-xl font-semibold text-[#F5EFE0]">Alder Projects</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#how-it-works" className="text-sm font-medium text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors">How It Works</Link>
          <Link href="/#project-types" className="text-sm font-medium text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors">Project Types</Link>
          <Link href="/guides" className="text-sm font-medium text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors">Guides</Link>
          <Link href="/calculator" className="text-sm font-medium text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors">Cost Calculator</Link>
          <Link href="/seasonal-home-report" className="text-sm font-medium text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors">Property Scan</Link>
          <Link href="/faq" className="text-sm font-medium text-[#F5EFE0]/70 hover:text-[#F5EFE0] transition-colors">FAQ</Link>
          <Link href="/contractors" className="text-sm font-medium text-[#7A9B6F]/90 hover:text-[#7A9B6F] transition-colors border border-[#7A9B6F]/30 hover:border-[#7A9B6F]/60 px-3 py-1.5 rounded-sm">For Contractors</Link>
          <Link href="/#submit-project" className="ml-2 px-5 py-2.5 bg-[#C8732A] hover:bg-[#A84E1A] text-[#FAF7F2] text-sm font-semibold rounded-sm transition-colors">Post a Project</Link>
        </div>
      </div>
    </nav>
  )
}
