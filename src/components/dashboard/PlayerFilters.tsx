/**
 * @component PlayerFilters
 * @description Affiche un ensemble de filtres pour la recherche de joueurs.
 * Inclut des filtres par poste, âge, pays et niveau.
 * @returns {JSX.Element} Le composant des filtres de joueurs.
 */
export function PlayerFilters() {
  return (
    <section className="relative isolate rounded-2xl bg-slate-900/50 p-6 shadow-md ring-1 ring-white/10">
      <h3 className="mb-4 text-white font-semibold">Filtres rapides des joueurs</h3>
      <div className="grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label
            htmlFor="position"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Poste
          </label>
          <select
            id="position"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            <option>Tous</option>
            <option>Gardien</option>
            <option>Défenseur</option>
            <option>Milieu</option>
            <option>Attaquant</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="age"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Âge
          </label>
          <input
            type="range"
            id="age"
            min="15"
            max="40"
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label
            htmlFor="country"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Pays
          </label>
          <input
            type="text"
            id="country"
            placeholder="Ex: France"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label
            htmlFor="level"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Niveau
          </label>
          <select
            id="level"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            <option>Tous</option>
            <option>U17</option>
            <option>U19</option>
            <option>U21</option>
            <option>Professionnel</option>
          </select>
        </div>
      </div>
    </section>
  );
}
