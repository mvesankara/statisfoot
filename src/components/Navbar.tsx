
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo + Nom */}
        <div className="flex items-center gap-3">
          <img
            src="/favicon_statisfoot.png"
            alt="Logo Statisfoot"
            className="h-9 w-auto"
          />
          <span className="font-semibold text-lg tracking-tight text-primary">
            Statisfoot
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#" className="hover:text-primary text-slate-600">
            Scouts
          </a>
          <a href="#" className="hover:text-primary text-slate-600">
            Recruteurs
          </a>
          <a href="#" className="hover:text-primary text-slate-600">
            Agents
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-accent text-primary font-semibold px-4 py-2"
          >
            Inscription
          </a>
        </nav>
      </div>
    </header>
  );
}
