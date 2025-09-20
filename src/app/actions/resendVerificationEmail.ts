"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function resendVerificationEmail() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  if (user.emailVerified) {
    throw new Error("Votre email est déjà vérifié.");
  }

  const verificationToken = randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
    },
  });

  await sendVerificationEmail(user.email, verificationToken);
}
