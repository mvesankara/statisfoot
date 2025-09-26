/**
 * @component Hero
 * @description Affiche la section "héros" de la page d'accueil, avec un titre accrocheur et des boutons d'appel à l'action.
 * @returns {JSX.Element} Le composant de la section "héros".
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="max-w-3xl text-4xl md:text-6xl font-extrabold leading-[1.05]">
          Donnons une chance à chaque talent
        </h1>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#decouvrir"
            className="inline-flex items-center rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 font-medium"
          >
            Découvrir les talents
          </a>
          <a
            href="#creer-compte"
            className="inline-flex items-center rounded-xl bg-white text-primary px-5 py-3 font-semibold"
          >
            Créer un compte recruteur
          </a>
        </div>
      </div>
    </section>
  );
}
