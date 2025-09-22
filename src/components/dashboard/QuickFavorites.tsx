const favoritePlayers = [
  { id: 1, name: "Lamine Yamal", age: 16, position: "Ailier Droit", lastReport: "2023-10-24", avatar: "/path/to/avatar1.png" },
  { id: 2, name: "Warren Zaïre-Emery", age: 17, position: "Milieu Central", lastReport: "2023-10-22", avatar: "/path/to/avatar2.png" },
  { id: 3, name: "Jude Bellingham", age: 20, position: "Milieu Offensif", lastReport: "2023-10-21", avatar: "/path/to/avatar3.png" },
];

export function QuickFavorites() {
  return (
    <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6 h-full">
      <h3 className="text-white font-semibold mb-4">Favoris rapides</h3>
      <div className="flex flex-col gap-4">
        {favoritePlayers.map((player) => (
          <div key={player.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-800/60">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0">
              {/* <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" /> */}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-white">{player.name}</p>
              <p className="text-sm text-slate-400">{player.position} - {player.age} ans</p>
            </div>
            <div className="text-right flex-shrink-0">
               <p className="text-xs text-slate-500">Dernier rapport</p>
               <p className="text-sm font-medium text-slate-300">{player.lastReport}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
