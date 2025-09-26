import { redirect } from "next/navigation";

import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { auth } from "@/lib/auth";

/**
 * @page DashboardPage
 * @description Page principale du tableau de bord. La page est protégée et nécessite une session active.
 * Affiche une interface dynamique basée sur des onglets pour naviguer entre les actions clés (nouveau rapport,
 * joueurs, rapports).
 * @returns {Promise<JSX.Element>} Le composant de la page du tableau de bord.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <DashboardTabs user={session.user ?? undefined} />;
}
