const requests = {
  open: [
    { id: 101, player: "Jérémy Doku", deadline: "2023-11-15" },
    { id: 102, player: "Xavi Simons", deadline: "2023-11-20" },
  ],
  inProgress: [
    { id: 103, player: "Cole Palmer", deadline: "2023-11-10" },
  ],
  inReview: [
    { id: 104, player: "Evan Ferguson", deadline: "2023-11-05" },
  ],
};

const columns = [
  { id: "open", title: "Ouvert", requests: requests.open },
  { id: "inProgress", title: "En cours", requests: requests.inProgress },
  { id: "inReview", title: "En attente de review", requests: requests.inReview },
];

/**
 * @component ReportRequests
 * @description Affiche un tableau de bord de type Kanban pour les demandes de rapports personnels.
 * Les demandes sont organisées en colonnes (Ouvert, En cours, En attente de review).
 * Les données sont actuellement statiques.
 * @returns {JSX.Element} Le composant des demandes de rapports.
 */
export function ReportRequests() {
  return (
    <section className="relative isolate rounded-2xl bg-slate-900/50 p-6 shadow-md ring-1 ring-white/10">
      <h3 className="mb-4 text-white font-semibold">Demandes de rapports personnels</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-4 rounded-lg bg-slate-800/50 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">{column.title}</h4>
            {column.requests.map((request) => (
              <div
                key={request.id}
                className="rounded-md bg-slate-900 p-3 ring-1 ring-slate-700"
              >
                <p className="font-semibold text-white">{request.player}</p>
                <p className="mt-1 text-xs text-slate-400">Date limite : {request.deadline}</p>
              </div>
            ))}
            {column.requests.length === 0 && (
              <p className="text-xs text-slate-400">Aucune demande dans cette colonne.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
