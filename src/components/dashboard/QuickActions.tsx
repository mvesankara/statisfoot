import Link from "next/link";

const actions = [
  {
    label: "Nouveau rapport",
    description: "Consigner une nouvelle observation terrain",
    href: "/reports/new",
  },
  {
    label: "Joueurs",
    description: "Explorer la base de joueurs existants",
    href: "/players",
  },
  {
    label: "Rapports",
    description: "Revoir l'ensemble de vos rapports sauvegardés",
    href: "/reports",
  },
];

/**
 * @component QuickActions
 * @description Affiche une liste d'actions rapides sous forme de boutons sur le tableau de bord.
 * @returns {JSX.Element} Le composant des actions rapides.
 */
export function QuickActions() {
  return (
    <section className="relative isolate rounded-2xl bg-slate-900/50 p-6 shadow-md ring-1 ring-white/10">
      <h3 className="mb-4 text-white font-semibold">Actions rapides</h3>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition hover:border-accent/50 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-end"
          >
            <span className="block text-sm font-semibold text-white">{action.label}</span>
            <span className="mt-1 block text-xs text-slate-400">{action.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
