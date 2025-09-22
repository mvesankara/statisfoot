"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const navItems = [
  "Tableau de bord",
  "Joueurs",
  "Rapports",
  "Demandes",
  "Favoris",
  "Facturation",
  "Paramètres",
];

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="w-[280px] bg-dark-start/50 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <img
          src="/favicon_statisfoot.png"
          alt="Logo Statisfoot"
          className="h-9 w-auto"
        />
        <span className="font-semibold text-lg tracking-tight text-white">
          Statisfoot
        </span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item}
            href="#"
            className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-accent/10 hover:text-white"
          >
            {item}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        {session && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-dark-start font-bold">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
