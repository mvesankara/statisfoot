// src/app/(auth)/login/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

/**
 * @page LoginPage
 * @description Page de connexion pour les utilisateurs.
 * Si l'utilisateur est déjà connecté, il est redirigé vers la page principale de l'application.
 * Affiche le formulaire de connexion (`LoginForm`).
 * @returns {Promise<JSX.Element>} Le composant de la page de connexion.
 */
export default async function LoginPage() {
  const session = await auth();

  if (session) redirect("/app"); // redispatch par rôle

  return (
    <>
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <p className="text-sm text-slate-400 mt-1">
        Accédez à votre espace personnel.
      </p>
      <LoginForm />
      <div className="mt-4 text-sm text-slate-400">
        <a href="/register" className="underline">
          Créer un compte
        </a>
        <span className="mx-2">•</span>
        <a href="/forgot-password" className="underline">
          Mot de passe oublié ?
        </a>
      </div>
    </>
  );
}
