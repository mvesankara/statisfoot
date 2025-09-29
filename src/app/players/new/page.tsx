import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";
import { NewPlayerForm } from "./NewPlayerForm";

/**
 * @page NewPlayerPage
 * @description Page de création d'un joueur.
 */
export default async function NewPlayerPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role as Role | undefined;
  const canCreatePlayer = role
    ? hasPermission(role, PERMISSIONS["players:create"])
    : false;

  if (!canCreatePlayer) {
    redirect("/players");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-slate-400">Créer un nouveau joueur</p>
        <h1 className="text-3xl font-bold text-white">Ajouter un joueur</h1>
        <p className="text-sm text-slate-400">
          Renseignez les informations de base du joueur pour l'ajouter à votre base
          Statisfoot. Vous pourrez enrichir sa fiche avec des rapports et des
          évaluations par la suite.
        </p>
      </header>

      <NewPlayerForm />
    </div>
  );
}
