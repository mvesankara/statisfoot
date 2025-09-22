import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MyReports } from "@/components/dashboard/MyReports";
import { KpiCharts } from "@/components/dashboard/KpiCharts";
import { QuickFavorites } from "@/components/dashboard/QuickFavorites";
import { ReportRequests } from "@/components/dashboard/ReportRequests";

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
