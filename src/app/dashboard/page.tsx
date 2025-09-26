import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MyReports, type DashboardReport } from "@/components/dashboard/MyReports";
import { KpiCharts } from "@/components/dashboard/KpiCharts";
import { QuickFavorites } from "@/components/dashboard/QuickFavorites";
import { ReportRequests } from "@/components/dashboard/ReportRequests";
import { PlayerFilters } from "@/components/dashboard/PlayerFilters";
import { LogoutButton } from "@/components/auth/LogoutButton";

type UserRole = "SCOUT" | "RECRUITER" | "AGENT" | "ADMIN";

const roleLabels: Record<UserRole, string> = {
  SCOUT: "Scout",
  RECRUITER: "Recruteur",
  AGENT: "Agent",
  ADMIN: "Administrateur",
};

const lastReportFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

type DashboardMetric = {
  label: string;
  value: string;
};

function DashboardHero({
  name,
  roleLabel,
  metrics,
}: {
  name: string;
  roleLabel: string;
  metrics: DashboardMetric[];
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-400">Bonjour, {name}</p>
          <h1 className="text-3xl font-bold text-white">
            Tableau de bord {roleLabel.toLowerCase()}
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl bg-slate-900/50 p-4 ring-1 ring-white/10"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScoutDashboard({ reports }: { reports: DashboardReport[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <KpiCharts />
          <MyReports reports={reports} />
        </div>
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <QuickActions />
          <QuickFavorites />
        </div>
      </div>
      <ReportRequests />
    </div>
  );
}

function CollaborativeDashboard({ reports }: { reports: DashboardReport[] }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 xl:col-span-8 space-y-6">
        <PlayerFilters />
        <MyReports reports={reports} />
      </div>
      <div className="col-span-12 xl:col-span-4 space-y-6">
        <QuickActions />
        <QuickFavorites />
      </div>
    </div>
  );
}

/**
 * @page DashboardPage
 * @description Page principale du tableau de bord.
 * Récupère la session de l'utilisateur et affiche le tableau de bord correspondant à son rôle.
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const role = (session.user.role ?? "SCOUT") as UserRole;

  const [recentReports, totalReports, playersCount] = await Promise.all([
    prisma.report.findMany({
      where: { authorId: userId },
      include: {
        player: {
          select: { id: true, name: true, position: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.report.count({ where: { authorId: userId } }),
    prisma.player.count(),
  ]);

  const lastReportDate = recentReports[0]?.createdAt ?? null;

  const displayName =
    [session.user.firstname, session.user.lastname].filter(Boolean).join(" ") ||
    session.user.name ||
    session.user.email ||
    "Utilisateur";

  const metrics: DashboardMetric[] = [
    { label: "Rapports rédigés", value: totalReports.toString() },
    { label: "Joueurs suivis", value: playersCount.toString() },
    {
      label: "Dernier rapport",
      value: lastReportDate ? lastReportFormatter.format(lastReportDate) : "—",
    },
  ];

  const content =
    role === "SCOUT" ? (
      <ScoutDashboard reports={recentReports} />
    ) : (
      <CollaborativeDashboard reports={recentReports} />
    );

  return (
    <div className="space-y-8">
      <DashboardHero
        name={displayName}
        roleLabel={roleLabels[role]}
        metrics={metrics}
      />
      {content}
      {role === "ADMIN" && (
        <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-6 text-sm text-slate-300">
          Des widgets spécifiques à l’administration seront prochainement disponibles.
        </div>
      )}
    </div>
  );
}
