import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const faqs = [
  {
    question: "Comment ajouter un nouveau rapport de match ?",
    answer:
      "Depuis le tableau de bord, utilisez l’action rapide “Nouveau rapport” ou rendez-vous sur la page Rapports puis cliquez sur le bouton Ajouter.",
  },
  {
    question: "Puis-je collaborer avec d’autres recruteurs ?",
    answer:
      "Oui, Statisfoot permet de partager vos observations avec votre staff et de suivre l’évolution des joueurs en temps réel.",
  },
  {
    question: "Où trouver la documentation complète ?",
    answer:
      "Accédez aux guides et tutoriels détaillés dans l’espace Ressources ou contactez directement notre équipe support.",
  },
];

const supportChannels = [
  {
    title: "Documentation",
    description: "Guides pas à pas, vidéos et bonnes pratiques pour exploiter Statisfoot au quotidien.",
    href: "#resources",
    label: "Consulter",
  },
  {
    title: "Support e-mail",
    description: "Écrivez-nous pour une assistance personnalisée dans un délai moyen de 24h.",
    href: "mailto:support@statisfoot.com",
    label: "Envoyer un e-mail",
  },
  {
    title: "Sessions live",
    description: "Participez aux webinaires mensuels pour découvrir les nouveautés produit.",
    href: "#webinars",
    label: "S’inscrire",
  },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 pb-16 text-slate-900">
        <div className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton variant="light" />
            <Breadcrumbs variant="light" />
          </div>

          <header className="mt-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-primary">Centre d’aide</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Trouvez rapidement les réponses à vos questions
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Ressources, FAQ et assistance dédiée pour vous accompagner dans le suivi et la valorisation des talents.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="help-search" className="sr-only">
                Rechercher un article d’aide
              </label>
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="help-search"
                  type="search"
                  placeholder="Rechercher dans la base de connaissances"
                  className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Contacter le support
              </Link>
            </div>
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-6">
              <div id="faq" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Questions fréquentes</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Une sélection des réponses les plus consultées par la communauté Statisfoot.
                </p>
                <div className="mt-6 space-y-4">
                  {faqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40"
                    >
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                        {faq.question}
                        <span className="ml-2 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500 transition group-open:border-primary/40 group-open:text-primary">
                          {""}
                        </span>
                      </summary>
                      <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>

              <div id="resources" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Ressources complémentaires</h2>
                <ul className="mt-4 space-y-3 text-sm text-primary">
                  <li>
                    <Link href="#guide-onboarding" className="transition hover:text-primary/80">
                      Guide d’onboarding pour les recruteurs
                    </Link>
                  </li>
                  <li>
                    <Link href="#model-rapport" className="transition hover:text-primary/80">
                      Modèle de rapport détaillé
                    </Link>
                  </li>
                  <li>
                    <Link href="#faq-video" className="transition hover:text-primary/80">
                      Vidéos tutoriels et masterclass
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Canaux d’assistance</h2>
                <div className="mt-4 space-y-3">
                  {supportChannels.map((channel) => (
                    <Link
                      key={channel.title}
                      href={channel.href}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span className="text-sm font-semibold text-slate-900">{channel.title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{channel.description}</span>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        {channel.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 6.414V17a1 1 0 11-2 0V6.414L9.707 8.707A1 1 0 018.293 7.293l4-4z" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div id="webinars" className="rounded-3xl bg-primary text-white">
                <div className="space-y-4 p-6">
                  <h2 className="text-lg font-semibold">Un besoin urgent ?</h2>
                  <p className="text-sm text-white/80">
                    Notre équipe reste disponible 7j/7 pour vous aider lors de vos déplacements ou sessions de scouting.
                  </p>
                  <Link
                    href="tel:+33102030405"
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
                  >
                    Appeler le support
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
