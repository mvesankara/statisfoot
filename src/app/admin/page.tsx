import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @page AdminDashboard
 * @description Page du tableau de bord pour les administrateurs.
 * Affiche des statistiques globales sur l'application (nombre d'utilisateurs, de rapports, de joueurs).
 * @returns {Promise<JSX.Element>} Le composant de la page du tableau de bord administrateur.
 */
export default async function AdminDashboard() {
  const [users, reports, players] = await Promise.all([
    prisma.user.count(),
    prisma.report.count(),
    prisma.player.count(),
  ]);

  return (
    <div className="p-8 grid grid-cols-3 gap-4">
      <div className="card">Users: {users}</div>
      <div className="card">Reports: {reports}</div>
      <div className="card">Players: {players}</div>
    </div>
  );
}
