export function Header() {
  return (
    <header className="h-16 bg-dark-start/30 backdrop-blur-sm border-b border-white/10 flex items-center px-6">
      <div className="flex-1">
        {/* Search bar placeholder */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un joueur, un rapport..."
            className="w-full max-w-sm bg-slate-900/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification bell placeholder */}
        <button className="p-2 rounded-full text-slate-400 hover:bg-accent/10 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>
        {/* Avatar placeholder */}
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-dark-start font-bold">
          U
        </div>
      </div>
    </header>
  );
}
