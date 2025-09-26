import Link from "next/link";

const actions = [
  { label: "Nouveau rapport", href: "/reports/new" },
  { label: "Répondre à une demande", href: "#" },
  { label: "Importer une vidéo", href: "#" },
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
            className="w-full text-center px-4 py-2 bg-accent text-dark-start font-semibold rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-end focus:ring-accent"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
