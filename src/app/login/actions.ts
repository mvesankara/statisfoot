"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

type State = string | null;

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
