"use client";

import type { JSX } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { LogoutButton } from "./auth/LogoutButton";

type NavItem = {
  label: string;
  href: string;
  icon: JSX.Element;
};

const primaryNav: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: "Joueurs",
    href: "/players",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.66 0-5.18-.584-7.5-1.632z"
        />
      </svg>
    ),
  },
  {
    label: "Rapports",
    href: "/reports",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 3h9a2.25 2.25 0 012.25 2.25v13.5A1.25 1.25 0 0117.5 20H6.5a1.25 1.25 0 01-1.25-1.25V5.25A2.25 2.25 0 017.5 3z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25h6M9 12h6M9 15.75h3" />
      </svg>
    ),
  },
];

const accountNav: NavItem[] = [
  {
    label: "Profil",
    href: "/profile",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 9a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 19.5a7.5 7.5 0 0115 0"
        />
      </svg>
    ),
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Aide",
    href: "/help",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519a3.5 3.5 0 016.31 1.981c0 2.04-1.493 2.968-2.624 3.717-.44.292-.816.54-1.073.845-.214.253-.33.552-.33.938v.5"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25h.008v.008H12z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

/**
 * @component Sidebar
 * @description Affiche la barre latérale de navigation de l’application.
 * Contient le logo, les liens de navigation principaux et les informations de l’utilisateur connecté.
 * @returns {JSX.Element} Le composant de la barre latérale.
 */
export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const fullName = session?.user
    ? (session.user.displayName ||
        session.user.name ||
        session.user.email ||
        "Mon compte")
    : "";
  const initials = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <aside className="hidden w-[280px] flex-col bg-dark-start/50 p-6 lg:flex">
      <Link
        href="/"
        className="mb-10 flex items-center gap-3 rounded-full px-2 py-1 text-white transition hover:bg-white/5"
        aria-label="Retour à l’accueil Statisfoot"
      >
        <Image
          src="/favicon_statisfoot.png"
          alt="Logo Statisfoot"
          width={36}
          height={36}
          priority
          className="h-9 w-auto"
        />
        <span className="font-semibold text-lg tracking-tight text-white">Statisfoot</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-6" aria-label="Navigation latérale">
        <div className="flex flex-col gap-1">
          <span className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vue d’ensemble
          </span>
          {primaryNav.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end ${
                  isActive
                    ? "bg-accent/15 text-white"
                    : "text-slate-300 hover:bg-accent/10 hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-accent">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          <span className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mon compte
          </span>
          {accountNav.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end ${
                  isActive
                    ? "bg-accent/15 text-white"
                    : "text-slate-300 hover:bg-accent/10 hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-accent">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="mt-auto space-y-4 pt-6">
        {session && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-4 ring-1 ring-white/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-base font-bold text-dark-start">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{fullName}</p>
              <p className="truncate text-xs uppercase text-slate-400">
                {session?.user?.role ?? "Utilisateur"}
              </p>
            </div>
          </div>
        )}
        <LogoutButton className="w-full justify-center" />
      </div>
    </aside>
  );
}
