import Link from "next/link";

export type DashboardReport = {
  id: string;
  status: string;
  createdAt: Date;
  content: string;
  player: {
    id: string;
    name: string;
    position: string;
  };
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  review: "En revue",
};

const statusStyles: Record<string, string> = {
  draft: "bg-slate-800 text-slate-300",
  published: "bg-emerald-500/10 text-emerald-300",
  review: "bg-amber-500/10 text-amber-300",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatStatus(status: string) {
  const normalized = status.toLowerCase();
  return statusLabels[normalized] ?? status;
}

function getStatusClassName(status: string) {
  const normalized = status.toLowerCase();
  return (
    statusStyles[normalized] ?? "bg-slate-800 text-slate-200"
  );
}

function formatExcerpt(content: string) {
  if (content.length <= 80) {
    return content;
  }
  return `${content.slice(0, 77)}…`;
}

interface MyReportsProps {
  reports: DashboardReport[];
}

/**
 * @component MyReports
 * @description Affiche un tableau des rapports de l'utilisateur sur le tableau de bord.
 * @param {MyReportsProps} props - Les propriétés du composant.
 * @returns {JSX.Element} Le composant du tableau des rapports.
 */
export function MyReports({ reports }: MyReportsProps) {
  return (
    <section className="relative isolate rounded-2xl bg-slate-900/50 p-6 shadow-md ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-white font-semibold">Mes rapports récents</h3>
        <Link
          href="/reports"
          className="text-xs font-medium text-accent transition hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end"
        >
          Voir tous les rapports
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center">
            <p className="text-sm text-slate-300">
              Aucun rapport enregistré pour le moment.
            </p>
            <Link
              href="/reports/new"
              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-dark-start hover:bg-accent/90"
            >
              Rédiger mon premier rapport
            </Link>
          </div>
        ) : (
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
                  Extrait
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Statut
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
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-white"
                  >
                    <span className="block text-sm">{report.player.name}</span>
                    <span className="text-xs text-slate-400">
                      ID {report.player.id}
                    </span>
                  </th>
                  <td className="px-6 py-4 text-sm capitalize">
                    {report.player.position.toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {formatExcerpt(report.content)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {dateFormatter.format(report.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(report.status)}`.trim()}
                    >
                      {formatStatus(report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      href={`/reports/${report.id}`}
                      className="font-medium text-accent transition hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end"
                    >
                      Consulter
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
