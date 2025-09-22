"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

type State = string | null;

/**
 * @async
 * @function loginAction
 * @description Server Action pour gérer la connexion de l'utilisateur.
 * Utilisée par le `LoginForm` avec `useActionState`.
 * @param {State} _ - L'état précédent (non utilisé).
 * @param {FormData} formData - Les données du formulaire de connexion.
 * @returns {Promise<State>} Un message d'erreur en cas d'échec, ou null en cas de succès avant la redirection.
 */
export async function loginAction(_: State, formData: FormData): Promise<State> {
  try {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!email || !password) return "Veuillez remplir tous les champs";
    await signIn("credentials", { email, password, redirect: true, redirectTo: "/app" });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Identifiants invalides";
        default:
          return "Erreur inattendue";
      }
    }
    throw error;
  }
}
