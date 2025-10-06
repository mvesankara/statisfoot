"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS, ROLES, type AppRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export type RoleUpdateState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const ROLE_OPTIONS = new Set<AppRole>(Object.values(ROLES));

export async function assignPrimaryRole(
  _prevState: RoleUpdateState,
  formData: FormData,
): Promise<RoleUpdateState> {
  const session = await auth();

  const role = session?.user?.role as AppRole | undefined;
  if (!role || !hasPermission(role, PERMISSIONS["admin:access"])) {
    return { status: "error", message: "Accès refusé" };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const requestedRole = String(formData.get("role") ?? "").trim().toUpperCase() as AppRole;

  if (!userId) {
    return { status: "error", message: "Identifiant utilisateur manquant" };
  }

  if (!ROLE_OPTIONS.has(requestedRole)) {
    return { status: "error", message: "Rôle sélectionné invalide" };
  }

  const roleRecord = await prisma.role.findUnique({ where: { name: requestedRole } });
  if (!roleRecord) {
    return { status: "error", message: "Rôle introuvable en base" };
  }

  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) {
    return { status: "error", message: "Utilisateur introuvable" };
  }

  await prisma.$transaction([
    prisma.userRole.deleteMany({
      where: {
        userId,
        NOT: { roleId: roleRecord.id },
      },
    }),
    prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: roleRecord.id },
      },
      update: {},
      create: {
        userId,
        roleId: roleRecord.id,
      },
    }),
  ]);

  revalidatePath("/admin");
  return { status: "success", message: "Rôle mis à jour" };
}
