import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewReportForm } from "@/components/reports/NewReportForm";

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-400">Renseignez un nouveau rapport de scouting.</p>
        <h1 className="text-3xl font-bold text-white">Nouveau rapport</h1>
      </div>
      <NewReportForm players={players} />
    </div>
  );
}

