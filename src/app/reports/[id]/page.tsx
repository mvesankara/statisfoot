import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPlayerName, formatPrimaryPosition } from "@/lib/players";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface ReportPageProps {
  params: { id: string };
}

/**
 * @page ReportDetailPage
 * @description Visualisation détaillée d'un rapport.
 */
export default async function ReportDetailPage({ params }: ReportPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      player: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          primaryPosition: true,
        },
      },
      author: {
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  const isOwner = report.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const authorName =
    report.author?.displayName ||
    (report.author?.username ? `@${report.author.username}` : undefined) ||
    report.author?.email ||
    "Auteur inconnu";

  const playerName = formatPlayerName(report.player.firstName, report.player.lastName);
  const playerPositionLabel = report.player.primaryPosition
    ? formatPrimaryPosition(report.player.primaryPosition)
    : "—";
  const matchDateLabel = report.matchDate
    ? dateFormatter.format(report.matchDate)
    : "—";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Rapport sur {playerName}</p>
          <h1 className="text-3xl font-bold text-white">Rapport #{report.id}</h1>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center justify-center rounded-full bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 hover:bg-slate-900"
        >
          Retour à la liste
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/50 p-6 ring-1 ring-white/10 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Observations</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">
            {report.content}
          </p>
        </div>
        <aside className="space-y-4 rounded-2xl bg-slate-900/40 p-6 ring-1 ring-white/10">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Joueur
            </h3>
            <p className="mt-2 text-lg font-semibold text-white">{playerName}</p>
            <p className="text-sm text-slate-300">
              Poste&nbsp;: {playerPositionLabel}
            </p>
            <p className="text-xs text-slate-500">ID {report.player.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Informations
            </h3>
            <dl className="mt-2 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <dt>Statut</dt>
                <dd className="capitalize">{report.status.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Match observé</dt>
                <dd>{matchDateLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Créé le</dt>
                <dd>{dateFormatter.format(report.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Auteur</dt>
                <dd className="text-right">{authorName}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>
    </div>
  );
}

