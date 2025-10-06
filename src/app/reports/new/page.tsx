import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPlayerName } from "@/lib/players";
import { hasAnyPermission, type AppRole } from "@/lib/rbac";
import { NewReportPageClient } from "./NewReportPageClient";

/**
 * @page NewReportPage
 * @description Page serveur permettant de préparer le formulaire de création de rapport.
 */
export default async function NewReportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role as AppRole | null | undefined;
  const canListPlayers =
    role && hasAnyPermission(role, ["players:read", "reports:create"]);

  const players = canListPlayers
    ? await prisma.player.findMany({
        orderBy: [
          { lastName: "asc" },
          { firstName: "asc" },
        ],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          primaryPosition: true,
        },
      })
    : [];

  const payload = players.map((player) => ({
    ...player,
    fullName: formatPlayerName(player.firstName, player.lastName),
  }));

  return <NewReportPageClient initialPlayers={payload} canListPlayers={Boolean(canListPlayers)} />;
}
