import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPlayerName, formatPrimaryPosition } from "@/lib/players";

type ReportListRow = {
  id: string;
  status: string;
  createdAt: Date;
  matchDate: Date | null;
  player: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    primaryPosition: string | null;
  };
} & Record<string, unknown>;

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/**
 * @page ReportsPage
 * @description Liste des rapports créés par l'utilisateur connecté.
 */
export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const reports = (await prisma.report.findMany({
    where: { authorId: session.user.id },
    include: {
      player: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          primaryPosition: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as ReportListRow[];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Historique de vos observations</p>
          <h1 className="text-3xl font-bold text-white">Mes rapports</h1>
        </div>
        <Link
          href="/reports/new"
          className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-dark-start hover:bg-accent/90"
        >
          Nouveau rapport
        </Link>
      </header>

      <div className="overflow-x-auto rounded-2xl bg-slate-900/50 ring-1 ring-white/10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/30 text-xs uppercase text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Joueur
              </th>
              <th scope="col" className="px-6 py-3">
                Poste
              </th>
              <th scope="col" className="px-6 py-3">
                Statut
              </th>
              <th scope="col" className="px-6 py-3">
                Match observé
              </th>
              <th scope="col" className="px-6 py-3">
                Créé le
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-slate-800/60 hover:bg-slate-800/40"
              >
                <th scope="row" className="px-6 py-4 font-medium text-white">
                  <span className="block text-sm">
                    {formatPlayerName(report.player.firstName, report.player.lastName)}
                  </span>
                  <span className="block text-xs text-slate-400">ID {report.player.id}</span>
                </th>
                <td className="px-6 py-4 capitalize">
                  {report.player.primaryPosition
                    ? formatPrimaryPosition(report.player.primaryPosition)
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm capitalize">{report.status.toLowerCase()}</td>
                <td className="px-6 py-4 text-sm">
                  {report.matchDate ? dateFormatter.format(report.matchDate) : "—"}
                </td>
                <td className="px-6 py-4 text-sm">{dateFormatter.format(report.createdAt)}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/reports/${report.id}`} className="text-accent hover:text-accent/80">
                    Consulter
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                  Aucun rapport disponible pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

