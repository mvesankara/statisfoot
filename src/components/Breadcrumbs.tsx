"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const LABELS: Record<string, string> = {
  "": "Accueil",
  dashboard: "Tableau de bord",
  players: "Joueurs",
  reports: "Rapports",
  profile: "Profil",
  settings: "Paramètres",
  help: "Aide",
  admin: "Administration",
  scout: "Scouting",
  app: "Application",
  login: "Connexion",
  register: "Inscription",
};

function formatSegment(segment: string, previous?: string) {
  if (LABELS[segment]) {
    return LABELS[segment];
  }

  if (segment === "new") {
    switch (previous) {
      case "players":
        return "Nouveau joueur";
      case "reports":
        return "Nouveau rapport";
      default:
        return "Nouveau";
    }
  }

  if (segment === "edit") {
    return "Modifier";
  }

  if (/^[0-9a-fA-F-]{10,}$/.test(segment)) {
    switch (previous) {
      case "players":
        return "Fiche joueur";
      case "reports":
        return "Rapport";
      default:
        return "Détails";
    }
  }

  if (/^\d+$/.test(segment)) {
    return "Détails";
  }

  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type BreadcrumbsProps = {
  className?: string;
  variant?: "dark" | "light";
};

export function Breadcrumbs({ className = "", variant = "dark" }: BreadcrumbsProps) {
  const pathname = usePathname();

  const segments = useMemo(() => {
    const path = pathname?.split("?")[0] ?? "/";
    const parts = path.split("/").filter(Boolean);

    return parts.map((part, index) => ({
      href: `/${parts.slice(0, index + 1).join("/")}`,
      label: formatSegment(part, parts[index - 1]),
    }));
  }, [pathname]);

  if (!pathname || pathname === "/") {
    return null;
  }

  const baseTextClass = variant === "light" ? "text-slate-500" : "text-slate-300";
  const activeTextClass = variant === "light" ? "text-slate-900" : "text-white";
  const hoverTextClass = variant === "light" ? "hover:text-slate-900" : "hover:text-white";

  return (
    <nav
      aria-label="Fil d’Ariane"
      className={`flex items-center gap-2 text-xs font-medium ${baseTextClass} ${className}`.trim()}
    >
      <Link
        href="/"
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition ${hoverTextClass}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M9.293 2.293a1 1 0 011.414 0l6 6A1 1 0 0116.586 9H16v7a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1V9H3.414a1 1 0 01-.707-1.707l6-6z" />
        </svg>
        Accueil
      </Link>
      {segments.map((segment, index) => (
        <span key={segment.href} className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 ${variant === "light" ? "text-slate-400" : "text-slate-500"}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {index === segments.length - 1 ? (
            <span className={activeTextClass} aria-current="page">
              {segment.label}
            </span>
          ) : (
            <Link
              href={segment.href}
              className={`transition ${hoverTextClass}`}
            >
              {segment.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
