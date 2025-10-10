"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";

import { BackButton } from "./BackButton";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * @component Header
 * @description Affiche l’en-tête principal de l’application, avec navigation secondaire,
 * fil d’Ariane, recherche globale et accès rapide au profil utilisateur.
 * @returns {JSX.Element} Le composant de l’en-tête.
 */
export function Header() {
  const { data: session } = useSession();

  const { displayName, email, imageUrl, initials } = useMemo(() => {
    const name =
      session?.user?.displayName ||
      session?.user?.name ||
      session?.user?.email ||
      "Utilisateur";

    const emailValue = session?.user?.email ?? "";
    const image = session?.user?.image ?? null;
    const firstLetter = name ? name.charAt(0).toUpperCase() : "U";

    return {
      displayName: name,
      email: emailValue,
      imageUrl: image,
      initials: firstLetter,
    };
  }, [session]);

  return (
    <header className="sticky top-0 z-40 flex flex-col gap-4 border-b border-white/10 bg-dark-start/70 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-dark-start/60 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton />
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end"
            aria-label="Afficher les notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </button>
          <Link
            href="/profile"
            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/40 px-2 py-1 transition hover:border-accent/40 hover:bg-slate-900/60"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Avatar de ${displayName}`}
                width={36}
                height={36}
                unoptimized
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-dark-start">
                {initials}
              </span>
            )}
            <span className="hidden flex-col text-left text-xs text-slate-300 sm:flex">
              <span className="font-semibold text-white">{displayName}</span>
              {email && <span className="text-slate-400">{email}</span>}
            </span>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            name="global-search"
            id="global-search"
            placeholder="Rechercher un joueur, un rapport ou une action..."
            className="w-full rounded-full border border-slate-700 bg-slate-900/60 py-2 pl-12 pr-4 text-sm text-white shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
            aria-label="Rechercher dans l’application"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3 sm:flex-none">
          <label htmlFor="quick-filter" className="sr-only">
            Filtrer par statut
          </label>
          <select
            id="quick-filter"
            className="w-full rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60 sm:w-auto"
            defaultValue="all"
          >
            <option value="all">Tous les contenus</option>
            <option value="players">Joueurs</option>
            <option value="reports">Rapports</option>
            <option value="alerts">Alertes</option>
          </select>
        </div>
      </div>
    </header>
  );
}
