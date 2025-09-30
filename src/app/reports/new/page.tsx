import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPlayerName } from "@/lib/players";
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

  const players = await prisma.player.findMany({

    orderBy: { lastName: "asc" },

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
  });

  const payload = players.map((player) => ({
    ...player,
    fullName: formatPlayerName(player.firstName, player.lastName),
  }));

  return <NewReportPageClient initialPlayers={payload} />;
}
