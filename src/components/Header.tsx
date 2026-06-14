type NavbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-3 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          
          {/* 1. BRAND LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold tracking-wider text-white">
              MovieFinder
            </span>
          </div>

          <div className="w-full sm:max-w-md">
            <label htmlFor="movie-search" className="sr-only">Search movies</label>
            <input
              id="movie-search"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search movies..."
              className="w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-amber-400 focus:bg-white/[0.08]"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
