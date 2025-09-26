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
    <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6">
      <h3 className="text-white font-semibold mb-4">Actions rapides</h3>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition hover:border-accent/50 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark-end"
          >
            <span className="block text-sm font-semibold text-white">{action.label}</span>
            <span className="mt-1 block text-xs text-slate-400">{action.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
