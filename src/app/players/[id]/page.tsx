import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPlayerName, formatPrimaryPosition } from "@/lib/players";
import { hasPermission, PERMISSIONS, type AppRole } from "@/lib/rbac";

const createdAtFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const reportDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type DisplayUser = {
  displayName: string | null;
  username: string | null;
  email: string | null;
} | null;

function formatUserName(user: DisplayUser) {
  if (!user) return "—";
  if (user.displayName) {
    return user.displayName;
  }
  if (user.username) {
    return `@${user.username}`;
  }
  return user.email ?? "—";
}

/**
 * @page PlayerProfile
 * @description Page de profil d'un joueur alimentée depuis la base de données.
 */
export default async function PlayerProfile({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role as AppRole | undefined;
  const canCreateReport = role
    ? hasPermission(role, PERMISSIONS["reports:create"])
    : false;

  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          displayName: true,
          username: true,
          email: true,
        },
      },
      _count: { select: { reports: true } },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              displayName: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const creatorLabel = formatUserName(player.creator);
  const playerFullName = formatPlayerName(player.firstName, player.lastName) || "Joueur";
  const primaryPositionLabel = player.primaryPosition
    ? formatPrimaryPosition(player.primaryPosition)
    : "—";

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 rounded-2xl bg-slate-900/50 p-8 ring-1 ring-white/10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-col gap-1 text-sm text-slate-400">
            <span>Fiche joueur</span>
            <span>ID Statisfoot : {player.id}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{playerFullName}</h1>
          <p className="text-sm text-slate-300">
            Poste principal : <span className="font-medium text-white">{primaryPositionLabel}</span>
          </p>
          <dl className="grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Ajouté le
              </dt>
              <dd className="mt-1 font-medium text-white">
                {createdAtFormatter.format(player.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Créé par
              </dt>
              <dd className="mt-1 font-medium text-white">{creatorLabel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Rapports associés
              </dt>
              <dd className="mt-1 font-medium text-white">
                {player._count.reports}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
          <Link
            href="/players"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/60 hover:text-accent"
          >
            Retour à la liste
          </Link>
          {canCreateReport && (
            <Link
              href={`/reports/new?playerId=${player.id}`}
              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-dark-start transition hover:bg-accent/90"
            >
              Rédiger un rapport
            </Link>
          )}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Rapports récents</h2>
          {canCreateReport && (
            <Link
              href={`/reports/new?playerId=${player.id}`}
              className="text-sm font-medium text-accent hover:text-accent/80"
            >
              Ajouter un nouveau rapport
            </Link>
          )}
        </div>
        {player.reports.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl bg-slate-900/50 ring-1 ring-white/10">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/30 text-xs uppercase text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Auteur
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody>
                {player.reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {report.title || "Rapport sans titre"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatUserName(report.author)}
                    </td>
                    <td className="px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
                      {report.status}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {reportDateFormatter.format(report.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-6 text-sm text-slate-300">
            Aucun rapport n'a encore été rédigé pour ce joueur.
            {canCreateReport && (
              <>
                {" "}
                <Link
                  href={`/reports/new?playerId=${player.id}`}
                  className="font-semibold text-accent hover:text-accent/80"
                >
                  Rédigez le premier rapport.
                </Link>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
