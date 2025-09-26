"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";

import { QuickActions } from "./QuickActions";
import { PlayerFilters } from "./PlayerFilters";
import { MyReports } from "./MyReports";
import { ReportRequests } from "./ReportRequests";

type TabId = "new-report" | "players" | "reports";

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: "new-report",
    label: "Nouveau rapport",
    description:
      "Préparez vos observations et centralisez les ressources nécessaires pour rédiger un nouveau rapport complet.",
  },
  {
    id: "players",
    label: "Joueurs",
    description:
      "Filtrez vos listes, identifiez des profils à suivre et retrouvez rapidement les fiches de vos talents prioritaires.",
  },
  {
    id: "reports",
    label: "Rapports",
    description:
      "Consultez vos rapports publiés, vos brouillons et les demandes en cours pour garder une vue d&apos;ensemble claire.",
  },
];

const HIGHLIGHTED_PLAYERS = [
  {
    id: 1,
    name: "Michel Ndong",
    age: 24,
    club: "AS Mangasport",
    position: "ATT",
    rating: "8.2",
    trend: "+1.4",
  },
  {
    id: 2,
    name: "Olivia Martin",
    age: 21,
    club: "FC Lyon",
    position: "MIL",
    rating: "7.5",
    trend: "+0.8",
  },
  {
    id: 3,
    name: "Yanis Traoré",
    age: 19,
    club: "RC Lens",
    position: "DEF",
    rating: "7.1",
    trend: "+0.5",
  },
];

const REPORT_STATS = [
  { id: "published", label: "Rapports publiés", value: 12 },
  { id: "pending", label: "En attente", value: 4 },
  { id: "drafts", label: "Brouillons", value: 3 },
];

type DashboardTabsProps = {
  user?: Pick<NonNullable<Session["user"]>, "firstname" | "lastname" | "role" | "name">;
};

const ROLE_MESSAGES: Partial<Record<string, string>> = {
  ADMIN: "Administrateur",
  SCOUT: "Scout",
  RECRUITER: "Recruteur",
  AGENT: "Agent",
};

export function DashboardTabs({ user }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("new-report");

  const nameParts = [user?.firstname, user?.lastname].filter(
    (value): value is string => Boolean(value && value.trim().length > 0),
  );
  const displayName =
    (nameParts.length > 0 ? nameParts.join(" ") : user?.name) ?? undefined;

  const roleLabel = user?.role
    ? ROLE_MESSAGES[user.role] ??
      `${user.role.charAt(0)}${user.role.slice(1).toLowerCase()}`
    : undefined;

  const activeTabData = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <div className="space-y-8 text-white">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Tableau de bord</p>
        <h1 className="text-3xl font-bold">Bonjour {displayName ?? "Statisfoot"} !</h1>
        <p className="text-slate-300 max-w-2xl">
          {roleLabel
            ? `Bienvenue dans votre espace ${roleLabel?.toLowerCase()}. Retrouvez ici vos priorités du moment.`
            : "Bienvenue dans votre espace personnalisé. Accédez rapidement aux actions les plus importantes pour votre activité."}
        </p>
      </header>

      <nav className="flex flex-wrap gap-3" aria-label="Sections du tableau de bord">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-end ${
              activeTab === tab.id
                ? "bg-accent border-accent text-dark-start"
                : "border-white/10 text-slate-300 hover:text-white"
            }`}
            aria-pressed={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <p className="text-slate-400 max-w-3xl">{activeTabData.description}</p>

      <section aria-live="polite" className="space-y-6">
        {activeTab === "new-report" && <NewReportTab />}
        {activeTab === "players" && <PlayersTab />}
        {activeTab === "reports" && <ReportsTab />}
      </section>
    </div>
  );
}

function NewReportTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6">
      <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Préparer un nouveau rapport</h2>
          <p className="mt-2 text-slate-300">
            Suivez les étapes clés pour gagner du temps : collecte de données, analyse vidéo et rédaction.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent">1</span>
            Sélectionnez le match ou les séquences vidéo à analyser et ajoutez vos premières notes contextuelles.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent">2</span>
            Renseignez les KPIs clés : volume de passes, zones d&apos;influence, comportements défensifs.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent">3</span>
            Structurez vos conclusions pour partager rapidement vos recommandations avec le staff.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 font-semibold text-dark-start transition hover:bg-accent/90"
          >
            Commencer un rapport
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-accent hover:text-accent"
          >
            Gérer mes rapports
          </Link>
        </div>
      </div>
      <QuickActions />
    </div>
  );
}

function PlayersTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
      <PlayerFilters />
      <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6">
        <h2 className="text-xl font-semibold text-white">Joueurs suivis récemment</h2>
        <p className="text-sm text-slate-400 mt-2">
          Gardez un œil sur les tendances de performance des profils clés que vous suivez.
        </p>
        <div className="mt-5 space-y-4">
          {HIGHLIGHTED_PLAYERS.map((player) => (
            <div key={player.id} className="bg-slate-900 rounded-xl border border-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-semibold text-base">{player.name}</p>
                  <p className="text-xs uppercase tracking-wide text-accent mt-1">
                    {player.position} • {player.club}
                  </p>
                </div>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                  Note {player.rating}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <dt className="uppercase tracking-wide text-slate-500">Âge</dt>
                  <dd className="text-white mt-1">{player.age} ans</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-slate-500">Tendance</dt>
                  <dd className="text-emerald-400 mt-1">{player.trend}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORT_STATS.map((stat) => (
          <div
            key={stat.id}
            className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md px-5 py-4"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
        <div className="space-y-6">
          <MyReports />
        </div>
        <ReportRequests />
      </div>
    </div>
  );
}
