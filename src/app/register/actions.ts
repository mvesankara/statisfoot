"use server";

import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { UserRoleEnum } from "@prisma/client";

import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export type State = string | null;
const ALLOWED_ROLES = new Set<UserRoleEnum>([
  UserRoleEnum.SCOUT,
  UserRoleEnum.RECRUITER,
  UserRoleEnum.AGENT,
]);

function buildBaseUsername(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const sanitized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");
  return sanitized || "user";
}

async function findAvailableUsername(base: string) {
  let candidate = base;
  let suffix = 1;

  while (true) {
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
}

function buildDisplayName(firstName: string, lastName: string, email: string) {
  const nameParts = [firstName, lastName].filter(Boolean);
  if (nameParts.length > 0) {
    return nameParts.join(" ");
  }
  const base = buildBaseUsername(email);
  return base.charAt(0).toUpperCase() + base.slice(1);
}
 
 /**
 * @async
 * @function register
 * @description Server Action pour gérer l'inscription d'un nouvel utilisateur.
 * Valide les données du formulaire, crée l'utilisateur en base de données,
 * et envoie un e-mail de vérification.
 * @param {State} prev - L'état précédent (utilisé pour afficher les erreurs).
 * @param {FormData} formData - Les données du formulaire d'inscription.
 * @returns {Promise<State>} Un message d'erreur en cas d'échec, ou redirige en cas de succès.
 */
export async function register(prev: State, formData: FormData): Promise<State> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email     = String(formData.get("email") ?? "").trim().toLowerCase();
  const password  = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const roleInput = String(formData.get("role") ?? "SCOUT").toUpperCase();

  if (!firstName || !lastName || !email || !password) return "Tous les champs obligatoires ne sont pas remplis";
  if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
  const normalizedRole = ALLOWED_ROLES.has(roleInput as UserRoleEnum)
    ? (roleInput as UserRoleEnum)
    : UserRoleEnum.SCOUT;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "Cet email est déjà utilisé";

  const baseUsername = buildBaseUsername(email);
  const username = await findAvailableUsername(baseUsername);
  const displayName = buildDisplayName(firstName, lastName, email);
  const hashedPass = await hash(password, 10);
  const verificationToken = randomBytes(32).toString("hex");
  const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      displayName,
      hashedPass,
      roles: {
        create: {
          role: {
            connect: { name: normalizedRole },
          },
        },
      },
    },
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

  await sendVerificationEmail(email, verificationToken);

  redirect("/login?verified=false");
}
