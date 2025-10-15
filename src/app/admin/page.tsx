import { RoleAssignmentForm } from "./role-assignment-form";

import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/rbac";

/**
 * @page AdminDashboard
 * @description Page du tableau de bord pour les administrateurs.
 * Affiche des statistiques globales sur l'application (nombre d'utilisateurs, de rapports, de joueurs).
 * @returns {Promise<JSX.Element>} Le composant de la page du tableau de bord administrateur.
 */
type LatestUsers = Awaited<ReturnType<typeof prisma.user.findMany>>;

export default async function AdminDashboard() {
  const [users, reports, players, latestUsers]: [
    number,
    number,
    number,
    LatestUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.report.count(),
    prisma.player.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        roles: {
          include: { role: true },
          orderBy: { assignedAt: "asc" },
        },
      },
    }),
  ]);

  const availableRoles = Object.values(ROLES);

  return (
    <div className="space-y-8 p-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Utilisateurs</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{users}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Rapports</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{reports}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Joueurs</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{players}</p>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <header className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Gestion des rôles utilisateurs
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Promotez ou rétrogradez un utilisateur vers l&apos;un des rôles supportés.
          </p>
        </header>
        <div className="divide-y divide-neutral-200">
          {latestUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-neutral-500">
              Aucun utilisateur trouvé.
            </p>
          ) : (
            latestUsers.map((user) => {
              const primaryRole = user.roles[0]?.role?.name ?? null;

              return (
                <article
                  key={user.id}
                  className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{user.displayName}</p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                  <RoleAssignmentForm
                    userId={user.id}
                    currentRole={primaryRole}
                    roles={availableRoles}
                  />
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
