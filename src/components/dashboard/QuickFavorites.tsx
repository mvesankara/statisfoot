const favoritePlayers = [
  { id: 1, name: "Lamine Yamal", age: 16, position: "Ailier Droit", lastReport: "2023-10-24", avatar: "/path/to/avatar1.png" },
  { id: 2, name: "Warren Zaïre-Emery", age: 17, position: "Milieu Central", lastReport: "2023-10-22", avatar: "/path/to/avatar2.png" },
  { id: 3, name: "Jude Bellingham", age: 20, position: "Milieu Offensif", lastReport: "2023-10-21", avatar: "/path/to/avatar3.png" },
];

/**
 * @component QuickFavorites
 * @description Affiche une liste des joueurs favoris de l'utilisateur sur le tableau de bord.
 * Les données sont actuellement statiques.
 * @returns {JSX.Element} Le composant de la liste des favoris.
 */
export function QuickFavorites() {
  return (
    <section className="relative isolate rounded-2xl bg-slate-900/50 p-6 shadow-md ring-1 ring-white/10">
      <h3 className="mb-4 text-white font-semibold">Favoris rapides</h3>
      <div className="flex flex-col gap-4">
        {favoritePlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-4 rounded-lg p-2 transition hover:bg-slate-800/60"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
              {player.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex flex-1 flex-col">
              <p className="font-semibold text-white">{player.name}</p>
              <p className="text-sm text-slate-400">
                {player.position} · {player.age} ans
              </p>
            </div>
            <div className="flex flex-col items-end text-right text-xs text-slate-400">
              <span className="uppercase tracking-wide">Dernier rapport</span>
              <span className="text-sm font-medium text-slate-200">{player.lastReport}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
