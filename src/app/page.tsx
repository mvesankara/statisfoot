import { Navbar } from "@/components/Navbar";

/**
 * @page Home
 * @description La page d'accueil (landing page) de l'application Statisfoot.
 * Elle présente l'application, ses fonctionnalités et des appels à l'action.
 * @returns {JSX.Element} Le composant de la page d'accueil.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO avec bannière */}
      <section className="relative isolate overflow-hidden">
        {/* Image de fond */}
        <img
          src="/hero1.png"
          alt="Joueurs de football"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />

        {/* Overlay bleu foncé transparent */}
        <div className="absolute inset-0 -z-10 bg-primary/70" />

        {/* Contenu */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-white">
          <h1 className="max-w-3xl text-4xl md:text-6xl font-extrabold leading-[1.05]">
            Donnons une chance à chaque talent
          </h1>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#"
              className="inline-flex items-center rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 font-medium"
            >
              Découvrir les talents
            </a>
            <a 
              href="#"
              className="inlne-flex items-center rounded-xl bg-white text-primary px-5 py-3 font-semibold"
            >
              Créer un compte recruteur
            </a>
          </div>
        </div>
      </section>

      {/* SECTION INTRO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          Qu’est-ce que Statisfoot ?
        </h2>
        <div className="mt-6 bg-slate-50 rounded-2xl p-6 text-center">
          <p className="text-slate-600 max-w-2xl mx-auto">
            Statisfoot aide les recruteurs et agents à identifier facilement
            de jeunes talents fiables dans les championnats peu médiatisés.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-extrabold text-primary">+200</div>
              <div className="mt-1 text-slate-600">scouts inscrits</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary">+20%</div>
              <div className="mt-1 text-slate-600">d’inscriptions en avril</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-primary">5</div>
              <div className="mt-1 text-slate-600">clubs partenaires</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEMOIGNAGE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-[auto,1fr] items-center rounded-2xl border border-slate-200 p-6">
          {/* Avatar fictif */}
          <div className="h-28 w-28 rounded-2xl bg-slate-300 flex items-center justify-center text-slate-700">
            Avatar
          </div>
          <blockquote>
            <p className="text-lg leading-relaxed text-slate-800">
              « Grâce à Statisfoot, j’ai identifié rapidement des talents dans
              des championnats peu médiatisés. Un outil précieux pour un
              recrutement moderne. »
            </p>
            <footer className="mt-3 text-sm text-slate-500">
              Jean Mba — Recruteur
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-4 mb-24 rounded-3xl bg-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h3 className="text-2xl md:text-3xl font-bold">
            Rejoignez la révolution du scouting en Afrique
          </h3>
          <p className="mt-2 text-white/80">
            Demandez une démo et accédez à une base fiable de jeunes talents.
          </p>
          <div className="mt-6">
            <a
              href="#demo"
              className="inline-flex items-center rounded-xl bg-accent text-primary px-5 py-3 font-semibold"
            >
              Demander une démo
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between text-sm text-slate-600">
          <div>© {new Date().getFullYear()} Statisfoot</div>
          <nav className="flex gap-6">
            <a href="#mentions" className="hover:text-primary">
              Mentions légales
            </a>
            <a href="#contact" className="hover:text-primary">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
