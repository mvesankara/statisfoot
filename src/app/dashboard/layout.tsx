import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

/**
 * @component DashboardLayout
 * @description Layout pour les pages du tableau de bord.
 * Il inclut la barre latérale (`Sidebar`) et l'en-tête (`Header`).
 * @param {object} props - Les props du composant.
 * @param {React.ReactNode} props.children - Les pages enfants du tableau de bord.
 * @returns {JSX.Element} Le layout du tableau de bord.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-dark-end">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
