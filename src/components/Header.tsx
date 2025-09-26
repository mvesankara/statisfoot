"use client";

import { signOut, useSession } from "next-auth/react";

const ROLE_LABELS = {
  ADMIN: "Administrateur",
  SCOUT: "Scout",
  RECRUITER: "Recruteur",
  AGENT: "Agent",
} as const;

/**
 * @component Header
 * @description Affiche l'en-tête principal de l'application. Inclut la barre de recherche,
 * l'icône de notification, les informations de l'utilisateur connecté et un bouton de déconnexion.
 * @returns {JSX.Element} Le composant de l'en-tête.
 */
export function Header() {
  const { data: session } = useSession();

  const fallbackNameParts = session?.user?.name?.split(" ") ?? [];
  const fallbackFirstname = fallbackNameParts[0] ?? null;
  const fallbackLastname =
    fallbackNameParts.length > 1 ? fallbackNameParts.slice(1).join(" ") : null;

  const firstname = session?.user?.firstname ?? fallbackFirstname;
  const lastname = session?.user?.lastname ?? fallbackLastname;

  const displayName = [firstname, lastname]
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .join(" ")
    .trim() || session?.user?.name;

  const role = session?.user?.role;
  const roleLabel = role
    ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role
    : undefined;

  const initials = (displayName ?? "Utilisateur")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-dark-start/30 backdrop-blur-sm border-b border-white/10 flex items-center px-6">
      <div className="flex-1">
        {/* Barre de recherche */}
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
      <div className="flex items-center gap-4 text-white">
        {displayName && (
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-semibold">{displayName}</span>
            {roleLabel && (
              <span className="text-xs text-slate-400 uppercase tracking-wide">{roleLabel}</span>
            )}
          </div>
        )}
        {/* Notification */}
        <button
          type="button"
          className="p-2 rounded-full text-slate-400 hover:bg-accent/10 hover:text-white transition"
          aria-label="Notifications"
        >
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
        {/* Bouton déconnexion */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-accent text-dark-start font-semibold px-4 py-2 transition hover:bg-accent/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Déconnexion
        </button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={MOBILE_BUTTON_CLASSES}
          aria-label="Déconnexion"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </button>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-dark-start font-bold uppercase">
          {initials || "U"}
        </div>
      </div>
    </header>
  );
}

const MOBILE_BUTTON_CLASSES =
  "sm:hidden inline-flex items-center justify-center rounded-full bg-accent text-dark-start font-semibold p-2 transition hover:bg-accent/90";
