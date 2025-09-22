import Image from "next/image";
import RadarChart from "@/components/RadarChart";
import KpiCard from "@/components/KpiCard";

/**
 * @async
 * @function getPlayer
 * @description Récupère les données d'un joueur par son ID.
 * Actuellement, utilise des données statiques en guise de placeholder.
 * @param {string} id - L'ID du joueur à récupérer.
 * @returns {Promise<object>} Un objet contenant les informations du joueur.
 */
async function getPlayer(id: string) {
  // Placeholder data; replace with real fetch to your API
  return {
    id,
    name: "John Doe",
    age: 20,
    foot: "Gauche",
    height: 180,
    position: "Attaquant",
    picture: "/favicon_statisfoot.png",
    radar: {
      labels: ["Vitesse", "Technique", "Physique", "Vision", "Finition"],
      values: [80, 75, 70, 85, 90],
    },
    kpis: [
      { label: "Buts", value: 10 },
      { label: "Passes", value: 7 },
      { label: "XG", value: 5.3 },
    ],
    recentForm: ["Bon match vs. A", "But vs. B", "Blessure légère"],
    contract: {
      status: "Actif",
      endDate: "2026-06-30",
      salary: "50k€",
      transferFee: "2M€",
    },
    comparison: [
      { name: "Player A", score: 92 },
      { name: "Player B", score: 88 },
    ],
    reports: [
      { id: "1", scout: "Scout 1", summary: "Très prometteur" },
      { id: "2", scout: "Scout 2", summary: "Bonne vision du jeu" },
    ],
  };
}

/**
 * @page PlayerProfile
 * @description Page de profil d'un joueur.
 * Affiche des informations détaillées sur un joueur, y compris ses statistiques,
 * des graphiques, des rapports et des informations contractuelles.
 * @param {object} props - Les props de la page.
 * @param {object} props.params - Les paramètres de la route dynamique.
 * @param {string} props.params.id - L'ID du joueur.
 * @returns {Promise<JSX.Element>} Le composant de la page de profil du joueur.
 */
export default async function PlayerProfile({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id);

  return (
    <div className="bg-white text-gray-800">
      <header className="bg-primary text-white p-6 flex items-center gap-4">
        <Image
          src={player.picture}
          alt={player.name}
          width={96}
          height={96}
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <p className="text-sm">
            {player.age} ans · {player.foot} · {player.height} cm · {player.position}
          </p>
          <p className="text-xs">ID Statisfoot : {player.id}</p>
          <div className="mt-3 space-x-2">
            <button className="btn-secondary">Ajouter à la short‑list</button>
            <button className="btn-primary">Demander contrat</button>
          </div>
        </div>
      </header>

      <nav className="border-b bg-white">
        <ul className="flex gap-6 p-4 text-sm font-medium text-gray-600">
          <li className="text-primary border-b-2 border-primary pb-1">Aperçu</li>
          <li>Statistiques</li>
          <li>Rapports scouts</li>
          <li>Contrat & disponibilité</li>
          <li>Comparaison</li>
          <li>Favoris</li>
        </ul>
      </nav>

      <div className="p-6 grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 space-y-6">
          <RadarChart data={player.radar} />

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {player.kpis.map((kpi) => (
              <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
            ))}
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Forme récente</h2>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {player.recentForm.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Contrat & disponibilité</h3>
            <p>Statut : {player.contract.status}</p>
            <p>Fin : {player.contract.endDate}</p>
            <p>Salaire : {player.contract.salary}</p>
            <p>Indemnité : {player.contract.transferFee}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Comparaison</h3>
            <ul className="text-sm">
              {player.comparison.map((c) => (
                <li key={c.name} className="flex justify-between">
                  <span>{c.name}</span>
                  <span className="font-medium">{c.score}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Rapports scouts</h3>
            <ul className="space-y-4 text-sm">
              {player.reports.map((r) => (
                <li key={r.id}>
                  <p className="font-medium">{r.scout}</p>
                  <p className="text-gray-600">{r.summary}</p>
                </li>
             ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
