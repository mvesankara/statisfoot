import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MyReports } from "@/components/dashboard/MyReports";
import { KpiCharts } from "@/components/dashboard/KpiCharts";
import { QuickFavorites } from "@/components/dashboard/QuickFavorites";
import { ReportRequests } from "@/components/dashboard/ReportRequests";

/**
 * @component ScoutDashboard
 * @description Affiche le tableau de bord spécifique pour les utilisateurs avec le rôle "SCOUT".
 * @returns {JSX.Element} Le tableau de bord pour les scouts.
 */
function ScoutDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Tableau de bord Scout</h1>
      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <KpiCharts />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <QuickActions />
        </div>
        <div className="col-span-12">
          <MyReports />
        </div>
        <div className="col-span-12">
          <QuickFavorites />
        </div>
        <div className="col-span-12">
          <ReportRequests />
        </div>
      </div>
    </div>
  );
}

import { PlayerFilters } from "@/components/dashboard/PlayerFilters";

/**
 * @component RecruiterAgentDashboard
 * @description Affiche le tableau de bord pour les utilisateurs avec les rôles "RECRUITER" ou "AGENT".
 * @returns {JSX.Element} Le tableau de bord pour les recruteurs et agents.
 */
function RecruiterAgentDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Tableau de bord Recruteur / Agent</h1>
      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <PlayerFilters />
        </div>
      </div>
    </div>
  );
}

/**
 * @page DashboardPage
 * @description Page principale du tableau de bord.
 * Récupère la session de l'utilisateur et affiche le tableau de bord correspondant à son rôle.
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 * @returns {Promise<JSX.Element>} Le composant de la page du tableau de bord.
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { role } = session.user;

  return (
    <div>
      {role === "SCOUT" && <ScoutDashboard />}
      {(role === "RECRUITER" || role === "AGENT") && <RecruiterAgentDashboard />}
      {role === "ADMIN" && <div>Admin Dashboard</div>}
    </div>
  );
}
