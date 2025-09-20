"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export type State = string | null;

export async function forgotPassword(prevState: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return "Veuillez entrer votre email.";
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
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

  await sendPasswordResetEmail(email, token);

  return "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.";
}
