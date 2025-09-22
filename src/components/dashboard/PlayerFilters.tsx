/**
 * @component PlayerFilters
 * @description Affiche un ensemble de filtres pour la recherche de joueurs.
 * Inclut des filtres par poste, âge, pays et niveau.
 * @returns {JSX.Element} Le composant des filtres de joueurs.
 */
export function PlayerFilters() {
  return (
    <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6">
      <h3 className="text-white font-semibold mb-4">Filtres rapides des joueurs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <label htmlFor="position" className="block text-xs font-medium text-slate-400 mb-1">Poste</label>
          <select id="position" className="w-full bg-slate-800 border-slate-700 rounded-md py-2 px-3 text-white focus:ring-accent focus:border-accent">
            <option>Tous</option>
            <option>Gardien</option>
            <option>Défenseur</option>
            <option>Milieu</option>
            <option>Attaquant</option>
          </select>
        </div>
        <div>
          <label htmlFor="age" className="block text-xs font-medium text-slate-400 mb-1">Âge</label>
          <input type="range" id="age" min="15" max="40" className="w-full" />
        </div>
        <div>
          <label htmlFor="country" className="block text-xs font-medium text-slate-400 mb-1">Pays</label>
          <input type="text" id="country" placeholder="Ex: France" className="w-full bg-slate-800 border-slate-700 rounded-md py-2 px-3 text-white focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label htmlFor="level" className="block text-xs font-medium text-slate-400 mb-1">Niveau</label>
          <select id="level" className="w-full bg-slate-800 border-slate-700 rounded-md py-2 px-3 text-white focus:ring-accent focus:border-accent">
            <option>Tous</option>
            <option>U17</option>
            <option>U19</option>
            <option>U21</option>
            <option>Professionnel</option>
          </select>
        </div>
      </div>
    </div>
  );
}
