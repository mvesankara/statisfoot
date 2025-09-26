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
    <div className="flex h-screen bg-dark-end">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
