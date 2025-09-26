import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * @page PlayersPage
 * @description Liste des joueurs enregistrés dans la base.
 */
export default async function PlayersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const players = await prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reports: true } },
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Base joueurs Statisfoot</p>
          <h1 className="text-3xl font-bold text-white">Joueurs</h1>
        </div>
        <p className="text-sm text-slate-400">
          {players.length} joueur{players.length > 1 ? "s" : ""} suivi{players.length > 1 ? "s" : ""}.
        </p>
      </header>

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
                    {player.name}
                  </Link>
                  <span className="block text-xs text-slate-400">ID {player.id}</span>
                </th>
                <td className="px-6 py-4 capitalize">{player.position.toLowerCase()}</td>
                <td className="px-6 py-4 text-sm">{player._count.reports}</td>
                <td className="px-6 py-4 text-sm">
                  {dateFormatter.format(player.createdAt)}
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                  Aucun joueur enregistré pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

