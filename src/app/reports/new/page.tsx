import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    orderBy: { name: "asc" },
    select: { id: true, name: true, position: true },
  });

  return <NewReportPageClient initialPlayers={players} />;
}
