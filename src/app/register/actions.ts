
"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

export type State = string | null;
const ALLOWED_ROLES = new Set(["SCOUT", "RECRUITER", "AGENT"]);

export async function register(prev: State, formData: FormData): Promise<State> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName  = String(formData.get("lastName") ?? "").trim();
  const country   = String(formData.get("country") ?? "").trim();
  const email     = String(formData.get("email") ?? "").trim().toLowerCase();
  const password  = String(formData.get("password") ?? "");
  const role      = String(formData.get("role") ?? "SCOUT").toUpperCase();

  if (!firstName || !lastName || !email || !password) return "Tous les champs obligatoires ne sont pas remplis";
  if (!ALLOWED_ROLES.has(role)) return "Rôle invalide";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "Cet email est déjà utilisé";

  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role as any,
      firstName,
      lastName,
      country: country || null,
      name: `${firstName} ${lastName}`.trim(), // pratique pour NextAuth/UI
    },
  });

  redirect("/login");
}
