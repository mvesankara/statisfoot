import Link from "next/link";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { auth } from "@/lib/auth";

const activityTimeline = [
  {
    id: "1",
    title: "Connexion sécurisée",
    description: "Authentification réussie depuis un nouvel appareil mobile.",
    date: "Aujourd’hui, 08:17",
  },
  {
    id: "2",
    title: "Nouveau rapport publié",
    description: "Rapport détaillé ajouté pour le joueur Emery Ndong.",
    date: "Hier, 19:42",
  },
  {
    id: "3",
    title: "Mise à jour du profil",
    description: "Ajout d’une signature personnalisée et des informations de contact.",
    date: "10 avril 2024",
  },
];

/**
 * @page ProfilePage
 * @description Page de profil enrichie de l’utilisateur.
 */
export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const displayName =
    session.user.displayName ||
    session.user.name ||
    session.user.email ||
    "Utilisateur";

  const email = session.user.email ?? "—";
  const role = session.user.role ?? "—";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-16 text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <BackButton />
            <Breadcrumbs />
          </div>

          <header className="mt-8 flex flex-col gap-6 rounded-3xl bg-slate-900/70 p-8 ring-1 ring-white/10 backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-3xl font-bold text-dark-start">
                  {initials}
                </span>
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">Profil utilisateur</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{displayName}</h1>
                  <p className="mt-1 text-sm text-white/70">{email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/60 hover:text-accent"
                >
                  Paramètres du compte
                </Link>
                <Link
                  href="mailto:support@statisfoot.com"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-dark-start transition hover:bg-accent/90"
                >
                  Contacter le support
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Rôle</p>
                <p className="mt-2 text-lg font-semibold text-white">{role}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Rapports publiés</p>
                <p className="mt-2 text-lg font-semibold text-white">27</p>
                <p className="text-xs text-white/50">+4 ce mois-ci</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Joueurs suivis</p>
                <p className="mt-2 text-lg font-semibold text-white">18</p>
                <p className="text-xs text-white/50">Dernier ajout : 2 jours</p>
              </div>
            </div>
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
                <h2 className="text-lg font-semibold text-white">Informations personnelles</h2>
                <p className="mt-1 text-sm text-white/70">
                  Gérez votre identité et la visibilité de vos coordonnées pour vos collaborateurs et clubs partenaires.
                </p>
                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <dt className="text-xs uppercase tracking-wide text-white/60">Nom complet</dt>
                    <dd className="mt-2 text-base font-medium text-white">{displayName}</dd>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <dt className="text-xs uppercase tracking-wide text-white/60">Email</dt>
                    <dd className="mt-2 text-base font-medium text-white">{email}</dd>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <dt className="text-xs uppercase tracking-wide text-white/60">Téléphone</dt>
                    <dd className="mt-2 text-base font-medium text-white/80">+241 •••• •• ••</dd>
                    <p className="mt-1 text-xs text-white/60">Ajoutez votre numéro pour faciliter le contact direct.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <dt className="text-xs uppercase tracking-wide text-white/60">Organisation</dt>
                    <dd className="mt-2 text-base font-medium text-white/90">Club partenaire non renseigné</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/settings"
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
                  >
                    Mettre à jour mes infos
                  </Link>
                  <span className="text-xs text-white/60">Prochaine vérification : 30 avril 2024</span>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
                <h2 className="text-lg font-semibold text-white">Historique d’activité</h2>
                <p className="mt-1 text-sm text-white/70">
                  Suivez les actions récentes associées à votre compte Statisfoot.
                </p>
                <ol className="mt-6 space-y-4">
                  {activityTimeline.map((item) => (
                    <li key={item.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
                      <span className="absolute -left-3 top-5 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-white/70">{item.description}</p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-white/50">{item.date}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
                <h2 className="text-lg font-semibold text-white">Mes accès rapides</h2>
                <div className="mt-4 space-y-3">
                  <Link
                    href="/reports/new"
                    className="block rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white transition hover:border-accent/60 hover:text-accent"
                  >
                    Rédiger un nouveau rapport
                  </Link>
                  <Link
                    href="/players"
                    className="block rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white transition hover:border-accent/60 hover:text-accent"
                  >
                    Voir mes joueurs suivis
                  </Link>
                  <Link
                    href="/settings?focus=security"
                    className="block rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white transition hover:border-accent/60 hover:text-accent"
                  >
                    Renforcer la sécurité
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
                <h2 className="text-lg font-semibold text-white">Déconnexion</h2>
                <p className="mt-1 text-sm text-white/70">
                  Quittez votre session en toute sécurité. Vous pourrez vous reconnecter avec votre e-mail habituel.
                </p>
                <LogoutButton className="mt-4 w-full justify-center bg-accent text-dark-start hover:bg-accent/90" />
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
