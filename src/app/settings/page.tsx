import Link from "next/link";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { auth } from "@/lib/auth";

const notificationPreferences = [
  {
    id: "notifications-email",
    label: "Rapports et suivis",
    description: "Recevoir un résumé hebdomadaire des nouveaux rapports et talents suivis.",
  },
  {
    id: "notifications-alerts",
    label: "Alertes de matchs",
    description: "Être notifié lorsqu’un joueur suivi est titularisé ou marque un but.",
  },
  {
    id: "notifications-security",
    label: "Sécurité du compte",
    description: "Confirmer les connexions inhabituelles et les changements sensibles.",
  },
];

const securityShortcuts = [
  {
    title: "Authentification renforcée",
    description: "Activer la double authentification pour sécuriser vos accès sensibles.",
    cta: "Configurer la MFA",
    href: "/settings?focus=security",
  },
  {
    title: "Sessions actives",
    description: "Visualiser et fermer les appareils actuellement connectés à votre compte.",
    cta: "Gérer les sessions",
    href: "/settings?focus=sessions",
  },
  {
    title: "Export des données",
    description: "Télécharger l’ensemble de vos rapports et favoris en format sécurisé.",
    cta: "Exporter",
    href: "/settings?focus=export",
  },
];

const connectedDevices = [
  {
    id: "1",
    label: "Macbook Pro · Paris",
    lastAccess: "Aujourd’hui, 09:42",
  },
  {
    id: "2",
    label: "iPhone 14 · Lyon",
    lastAccess: "Hier, 22:15",
  },
  {
    id: "3",
    label: "Surface Pro · Libreville",
    lastAccess: "12 avril, 18:03",
  },
];

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const displayName =
    session.user.displayName ||
    session.user.name ||
    session.user.email ||
    "Utilisateur";

  const email = session.user.email ?? "";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pb-16 text-slate-900">
        <div className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton variant="light" />
              <Breadcrumbs variant="light" />
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
            >
              Voir mon profil
            </Link>
          </div>

          <header className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <p className="text-sm font-medium text-primary">Paramètres du compte</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Personnalisez votre expérience Statisfoot
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Ajustez vos préférences, sécurisez votre compte et contrôlez vos notifications pour rester concentré sur ce qui
              compte : l’identification de talents.
            </p>
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Profil et identité</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Ces informations sont affichées auprès de vos collaborateurs sur les rapports et fiches joueurs.
                </p>
                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Nom complet</dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">{displayName}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Adresse e-mail</dt>
                    <dd className="mt-2 text-base font-medium text-slate-900">{email}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/profile?edit=true"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                  >
                    Modifier mes informations
                  </Link>
                  <span className="text-xs text-slate-500">Dernière mise à jour : 8 avril 2024</span>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choisissez comment et quand Statisfoot doit vous informer.
                </p>
                <form className="mt-6 space-y-4" aria-describedby="notification-helper">
                  {notificationPreferences.map((preference) => (
                    <label
                      key={preference.id}
                      htmlFor={preference.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-primary/40"
                    >
                      <input
                        id={preference.id}
                        name={preference.id}
                        type="checkbox"
                        defaultChecked
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{preference.label}</span>
                        <span className="mt-1 block text-sm text-slate-600">{preference.description}</span>
                      </span>
                    </label>
                  ))}
                  <p id="notification-helper" className="text-xs text-slate-500">
                    Vous pouvez modifier ces préférences à tout moment. Les changements sont enregistrés automatiquement.
                  </p>
                </form>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Sécurité rapide</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Assurez-vous que seuls vos collaborateurs autorisés peuvent accéder aux données sensibles.
                </p>
                <div className="mt-6 space-y-4">
                  {securityShortcuts.map((shortcut) => (
                    <Link
                      key={shortcut.href}
                      href={shortcut.href}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span className="text-sm font-semibold text-slate-900">{shortcut.title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{shortcut.description}</span>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        {shortcut.cta}
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

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Appareils connectés</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Déconnectez un appareil si vous ne le reconnaissez pas.
                </p>
                <ul className="mt-4 space-y-3">
                  {connectedDevices.map((device) => (
                    <li
                      key={device.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{device.label}</p>
                        <p className="text-xs text-slate-500">Dernier accès : {device.lastAccess}</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary/60 hover:text-primary"
                        aria-label={`Déconnecter ${device.label}`}
                      >
                        Déconnecter
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </section>

          <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Besoin d’assistance ?</h2>
              <p className="mt-1 text-sm text-slate-600">
                Consultez la foire aux questions ou contactez directement l’équipe support.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
              >
                Centre d’aide
              </Link>
              <LogoutButton className="px-4" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
