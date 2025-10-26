"use server";

/**
 * @file Server Action pour renvoyer l'e-mail de vérification.
 * @description Cette action permet à un utilisateur connecté de demander un nouvel e-mail de vérification
 * si son adresse e-mail n'est pas encore vérifiée.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { debug } from "@/lib/debug";

/**
 * @async
 * @function resendVerificationEmail
 * @description Renvoie un nouvel e-mail de vérification à l'utilisateur actuellement connecté.
 * @throws {Error} Si l'utilisateur n'est pas connecté.
 * @throws {Error} Si l'utilisateur n'est pas trouvé dans la base de données.
 * @throws {Error} Si l'e-mail de l'utilisateur est déjà vérifié.
 */
export async function resendVerificationEmail() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  debug("verify-email", "Demande de renvoi de vérification", {
    userId: session.user.id,
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  if (user.emailVerified) {
    debug("verify-email", "Email déjà vérifié", { userId: user.id });
    throw new Error("Votre email est déjà vérifié.");
  }

  const verificationToken = randomBytes(32).toString("hex");
  const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  debug("verify-email", "Nouveau jeton généré", {
    userId: user.id,
    expiry: verificationExpiresAt,
  });

  await prisma.emailVerificationToken.upsert({
    where: { userId: user.id },
    update: { token: verificationToken, expiresAt: verificationExpiresAt },
    create: {
      userId: user.id,
      token: verificationToken,
      expiresAt: verificationExpiresAt,
    },
  });

  await sendVerificationEmail(user.email, verificationToken);

  debug("verify-email", "Email de vérification envoyé", { userId: user.id });
}
