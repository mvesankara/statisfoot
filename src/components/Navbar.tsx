"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

/**
 * @component Navbar
 * @description Affiche la barre de navigation principale de l’application.
 * Gère l’affichage des liens en fonction de l’état d’authentification de l’utilisateur (connecté ou non).
 * Inclut une version mobile responsive.
 * @returns {JSX.Element} Le composant de la barre de navigation.
 */
export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navigation = useMemo(
    () => [
      { label: "Accueil", href: "/" },
      { label: "Tableau de bord", href: "/dashboard" },
      { label: "Profil", href: "/profile" },
      { label: "Paramètres", href: "/settings" },
      { label: "Aide", href: "/help" },
    ],
    [],
  );

  function closeMenu() {
    setOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Nom */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full px-2 py-1 text-primary transition hover:bg-primary/5"
          aria-label="Aller à l’accueil Statisfoot"
        >
          <Image
            src="/favicon_statisfoot.png"
            alt="Logo Statisfoot"
            width={36}
            height={36}
            priority
            className="h-9 w-auto"
          />
          <span className="font-semibold text-lg tracking-tight transition group-hover:text-primary/80">
            Statisfoot
          </span>
        </Link>

        {/* Bouton mobile */}
        <button
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fermer la navigation" : "Ouvrir la navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 md:hidden"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5" />
            )}
          </svg>
        </button>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 font-medium transition hover:text-primary ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-slate-600"
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/reports/new"
              className="inline-flex items-center rounded-full border border-primary/30 px-4 py-2 font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
            >
              Nouveau rapport
            </Link>
          )}
          {session ? (
            <button
              onClick={() => signOut()}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>

      {/* Navigation mobile */}
      <div
        id="main-navigation"
        className={`md:hidden border-t border-slate-200 bg-white transition-[max-height] duration-300 ease-in-out ${
          open ? "max-h-screen" : "max-h-0 overflow-hidden"
        }`}
      >
        <nav className="flex flex-col gap-2 px-4 py-4 text-sm" aria-label="Navigation principale mobile">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`rounded-lg px-3 py-2 font-medium transition hover:bg-primary/10 ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-700"
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/reports/new"
              onClick={closeMenu}
              className="rounded-lg px-3 py-2 font-semibold text-primary transition hover:bg-primary/10"
            >
              Nouveau rapport
            </Link>
          )}
          {session ? (
            <button
              onClick={() => {
                closeMenu();
                void signOut();
              }}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
