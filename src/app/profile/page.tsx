import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";

/**
 * @page ProfilePage
 * @description Page de profil de l'utilisateur.
 * Affiche les informations de l'utilisateur connecté (nom, email, rôle).
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 * @returns {Promise<JSX.Element>} Le composant de la page de profil.
 */
export default async function ProfilePage() {
  const session = (await auth()) as {
    user?: {
      name?: string;
      email?: string;
      role?: string;
    };
  } | null;

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <div className="mt-4 card">
          <p><strong>Nom:</strong> {session.user?.name}</p>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Rôle:</strong> {session.user?.role}</p>
        </div>
      </main>
    </>
  );
}
