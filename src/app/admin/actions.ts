"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS, ROLES, type AppRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { debug } from "@/lib/debug";

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

  debug("admin:roles", "Soumission de mise à jour de rôle", {
    actingUserId: session?.user?.id,
    actingRole: session?.user?.role,
  });

  const role = session?.user?.role as AppRole | undefined;
  if (!role || !hasPermission(role, PERMISSIONS["admin:access"])) {
    debug("admin:roles", "Accès refusé", { actingUserId: session?.user?.id });
    return { status: "error", message: "Accès refusé" };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const requestedRole = String(formData.get("role") ?? "").trim().toUpperCase() as AppRole;

  if (!userId) {
    debug("admin:roles", "Identifiant utilisateur manquant");
    return { status: "error", message: "Identifiant utilisateur manquant" };
  }

  if (!ROLE_OPTIONS.has(requestedRole)) {
    debug("admin:roles", "Rôle demandé invalide", { requestedRole });
    return { status: "error", message: "Rôle sélectionné invalide" };
  }

  const roleRecord = await prisma.role.findUnique({ where: { name: requestedRole } });
  if (!roleRecord) {
    debug("admin:roles", "Rôle introuvable en base", { requestedRole });
    return { status: "error", message: "Rôle introuvable en base" };
  }

  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) {
    debug("admin:roles", "Utilisateur cible introuvable", { userId });
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

  debug("admin:roles", "Rôle principal mis à jour", {
    userId,
    newRole: requestedRole,
  });

  revalidatePath("/admin");
  return { status: "success", message: "Rôle mis à jour" };
}
