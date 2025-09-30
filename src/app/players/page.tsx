import Link from "next/link";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPlayerName, formatPrimaryPosition } from "@/lib/players";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/rbac";

import CreatePlayerForm from "./CreatePlayerForm";


const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const ROLE_VALUES = Object.values(ROLES) as Role[];

/**
 * @page PlayersPage
 * @description Liste des joueurs enregistrés dans la base.
 */
export default async function PlayersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role =
    session.user.role && ROLE_VALUES.includes(session.user.role as Role)
      ? (session.user.role as Role)
      : undefined;
  const canCreatePlayer = role
    ? hasPermission(role, PERMISSIONS["players:create"])
    : false;


  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reports: true } },
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Base joueurs Statisfoot</p>
          <h1 className="text-3xl font-bold text-white">Joueurs</h1>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-400">
            {players.length} joueur{players.length > 1 ? "s" : ""} suivi
            {players.length > 1 ? "s" : ""}.
          </p>
          {canCreatePlayer && (
            <Link
              href="/players/new"
              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-dark-start transition hover:bg-accent/90"
            >
              Ajouter un joueur
            </Link>
          )}
        </div>
      </header>

      {canCreatePlayer && <CreatePlayerForm />}

      <div className="overflow-x-auto rounded-2xl bg-slate-900/50 ring-1 ring-white/10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/30 text-xs uppercase text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Joueur
              </th>
              <th scope="col" className="px-6 py-3">
                Poste
              </th>
              <th scope="col" className="px-6 py-3">
                Rapports
              </th>
              <th scope="col" className="px-6 py-3">
                Ajouté le
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                key={player.id}
                className="border-b border-slate-800/60 hover:bg-slate-800/40"
              >
                <th scope="row" className="px-6 py-4 font-medium text-white">
                  <Link
                    href={`/players/${player.id}`}
                    className="hover:text-accent"
                  >
                    {formatPlayerName(player.firstName, player.lastName)}
                  </Link>
                  <span className="block text-xs text-slate-400">ID {player.id}</span>
                </th>
                <td className="px-6 py-4 capitalize">
                  {player.primaryPosition
                    ? formatPrimaryPosition(player.primaryPosition)
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm">{player._count.reports}</td>
                <td className="px-6 py-4 text-sm">
                  {dateFormatter.format(player.createdAt)}
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-slate-400"
                >
                  Aucun joueur enregistré pour le moment.
                  {canCreatePlayer && (
                    <span className="mt-2 block text-accent">
                      Ajoutez votre premier joueur pour commencer le suivi.
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
