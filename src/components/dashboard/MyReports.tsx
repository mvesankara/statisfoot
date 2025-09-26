const reports = [
  { id: 1, status: "Publié", date: "2023-10-26", player: "Kylian Mbappé", club: "PSG" },
  { id: 2, status: "En revue", date: "2023-10-24", player: "Lamine Yamal", club: "FC Barcelona" },
  { id: 3, status: "Brouillon", date: "2023-10-22", player: "Warren Zaïre-Emery", club: "PSG" },
  { id: 4, status: "Rejeté", date: "2023-10-21", player: "Jude Bellingham", club: "Real Madrid" },
];

/**
 * @component MyReports
 * @description Affiche un tableau des rapports de l'utilisateur sur le tableau de bord.
 * Les données sont actuellement statiques mais sont destinées à être remplacées par des données dynamiques.
 * @returns {JSX.Element} Le composant du tableau des rapports.
 */
export function MyReports() {
  return (
    <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6">
      <h3 className="text-white font-semibold mb-4">Mes rapports</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/30">
            <tr>
              <th scope="col" className="px-6 py-3">Joueur</th>
              <th scope="col" className="px-6 py-3">Club</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Statut</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{report.player}</th>
                <td className="px-6 py-4">{report.club}</td>
                <td className="px-6 py-4">{report.date}</td>
                <td className="px-6 py-4">
                  {/* Status badge would go here */}
                  <span>{report.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href="#" className="font-medium text-accent hover:underline">Éditer</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
