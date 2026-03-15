export default function Footer() {
  return (
    <footer className="bg-[#0F1A0E] py-16 border-t border-[#7A9B6F]/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 mb-4">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
          </svg>
          <span className="font-display text-lg font-semibold text-[#F5EFE0]">Alder Projects</span>
        </div>
        <p className="text-[#F5EFE0]/35 text-sm max-w-xs mb-3">Vermont’s construction lead engine. Matching project owners with qualified local contractors across all 14 counties.</p>
        <p className="text-[#7A9B6F] text-xs font-mono mb-10">hello@alderprojects.com</p>
        {/* Popular Searches — links to SEO pages for Google indexing */}
        <div className="mb-10">
          <p className="text-[#F5EFE0]/25 text-xs font-mono uppercase tracking-widest mb-4">Popular Searches</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              ['Kitchen remodeling Vermont', '/kitchen-remodeling-vermont'],
              ['Bathroom remodeling Vermont', '/bathroom-remodeling-vermont'],
              ['Deck builders Vermont', '/deck-builders-vermont'],
              ['Home additions Vermont', '/home-additions-vermont'],
              ['Kitchen remodeling Burlington', '/kitchen-remodeling-burlington-vt'],
              ['Bathroom remodeling Burlington', '/bathroom-remodeling-burlington-vt'],
              ['Deck builders Burlington', '/deck-builders-burlington-vt'],
              ['Kitchen remodeling Stowe', '/kitchen-remodeling-stowe-vt'],
              ['Deck builders Stowe', '/deck-builders-stowe-vt'],
              ['Kitchen remodeling Middlebury', '/kitchen-remodeling-middlebury-vt'],
              ['Contractors Chittenden County', '/chittenden-county-vt'],
              ['Contractors Addison County', '/addison-county-vt'],
              ['Contractors Lamoille County', '/lamoille-county-vt'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="text-[#F5EFE0]/30 text-xs font-mono hover:text-[#7A9B6F] transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-[#7A9B6F]/10 pt-8">
          <p className="text-[#F5EFE0]/25 text-xs font-mono">© {new Date().getFullYear()} Alder Projects LLC · Vermont, USA</p>
        </div>
      </div>
    </footer>
  )
}
