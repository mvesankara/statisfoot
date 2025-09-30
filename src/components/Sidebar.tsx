"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard" },
  { label: "Joueurs", href: "/players" },
  { label: "Rapports", href: "/reports" },
];

/**
 * @component Sidebar
 * @description Affiche la barre latérale de navigation de l'application.
 * Contient le logo, les liens de navigation principaux et les informations de l'utilisateur connecté.
 * @returns {JSX.Element} Le composant de la barre latérale.
 */
export function Sidebar() {
  const { data: session } = useSession();
  const fullName = session?.user
    ? (session.user.displayName ||
        session.user.name ||
        session.user.email ||
        "Mon compte")
    : "";
  const initials = fullName ? fullName.charAt(0).toUpperCase() : "U";

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
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 transition hover:bg-accent/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        {session && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-dark-start font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-white">{fullName}</p>
              <p className="text-xs uppercase text-slate-400">{session.user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
