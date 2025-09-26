"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

export type State = string | null;

/**
 * @async
 * @function resetPassword
 * @description Server Action pour réinitialiser le mot de passe de l'utilisateur.
 * Vérifie la validité du jeton, met à jour le mot de passe en base de données,
 * et supprime le jeton de réinitialisation.
 * @param {State} prevState - L'état précédent (utilisé pour afficher les erreurs).
 * @param {FormData} formData - Les données du formulaire.
 * @returns {Promise<State>} Un message d'erreur en cas d'échec, ou redirige en cas de succès.
 */
export async function resetPassword(prevState: State, formData: FormData): Promise<State> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return "Token manquant.";
  }

  if (password !== confirmPassword) {
    return "Les mots de passe ne correspondent pas.";
  }

  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return "Le token est invalide ou a expiré.";
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    },
  });

  redirect("/login?reset=true");
}
