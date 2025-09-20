"use server";

import { signIn } from "next-auth/react";
import { prisma } from "@/lib/prisma";

type State = string | null;

export async function loginAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return "Veuillez remplir tous les champs";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return "Aucun compte n'est associé à cet email.";

  const res = await signIn("credentials", { redirect: false, email, password });
  if (!res) return "Erreur inattendue";
  if (res.error) return "Identifiants invalides";
  return null;
}
