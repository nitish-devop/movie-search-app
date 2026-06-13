function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. BRAND LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
              MovieFinder
            </span>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
