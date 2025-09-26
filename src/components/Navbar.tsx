"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * @component Navbar
 * @description Affiche la barre de navigation principale de l'application.
 * Gère l'affichage des liens en fonction de l'état d'authentification de l'utilisateur (connecté ou non).
 * Inclut une version mobile responsive.
 * @returns {JSX.Element} Le composant de la barre de navigation.
 */
export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

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

        {/* Bouton mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-slate-100"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-slate-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5"
            />
          </svg>
        </button>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {session && (
            <a
              href="/reports/new"
              className="hover:text-primary text-slate-600"
            >
              Nouveau rapport
            </a>
          )}
          {session ? (
            <>
              <a href="/profile" className="hover:text-primary text-slate-600">
                Mon profil
              </a>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center rounded-full bg-accent text-primary font-semibold px-4 py-2"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="inline-flex items-center rounded-full bg-accent text-primary font-semibold px-4 py-2"
            >
              Connexion
            </a>
          )}
        </nav>
      </div>

      {/* Navigation mobile */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-4 flex flex-col gap-4 text-sm">
            {session && (
              <a
                href="/reports/new"
                className="hover:text-primary text-slate-700"
              >
                Nouveau rapport
              </a>
            )}
            {session ? (
              <>
                <a href="/profile" className="hover:text-primary text-slate-700">
                  Mon profil
                </a>
                <button
                  onClick={() => signOut()}
                  className="inline-flex justify-center items-center rounded-full bg-accent text-primary font-semibold px-4 py-2"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="inline-flex justify-center items-center rounded-full bg-accent text-primary font-semibold px-4 py-2"
              >
                Connexion
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
