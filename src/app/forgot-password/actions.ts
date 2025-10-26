"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { debug } from "@/lib/debug";

export type State = string | null;

/**
 * @async
 * @function forgotPassword
 * @description Server Action pour gérer la demande de réinitialisation de mot de passe.
 * Génère un jeton de réinitialisation, le stocke en base de données et envoie un e-mail à l'utilisateur.
 * @param {State} prevState - L'état précédent (utilisé pour afficher les messages).
 * @param {FormData} formData - Les données du formulaire.
 * @returns {Promise<State>} Un message de confirmation.
 */
export async function forgotPassword(prevState: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  debug("forgot-password", "Demande de réinitialisation reçue", { email });

  if (!email) {
    return "Veuillez entrer votre email.";
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    debug("forgot-password", "Aucun utilisateur trouvé pour l'email", { email });
    return "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.";
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpiry: expiry,
    },
  });

  debug("forgot-password", "Jeton de réinitialisation généré", {
    userId: user.id,
    expiry,
  });

  await sendPasswordResetEmail(email, token);

  debug("forgot-password", "Email de réinitialisation envoyé", { userId: user.id });

  return "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.";
}
