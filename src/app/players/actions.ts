"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS, ROLES, type AppRole } from "@/lib/rbac";
import {
  createPlayerSchema,
  normalizePlayerInput,
  type CreatePlayerInput,
} from "@/lib/players";
import { debug } from "@/lib/debug";

import type { CreatePlayerState } from "./state";

const ROLE_VALUES = Object.values(ROLES) as AppRole[];

function resolveRole(value: string | undefined | null): AppRole | null {
  if (!value) {
    return null;
  }
  return ROLE_VALUES.includes(value as AppRole) ? (value as AppRole) : null;
}

export async function persistPlayer(input: CreatePlayerInput) {
  const normalized = normalizePlayerInput(input);

  debug("players", "Persistance d'un joueur", normalized);

  return prisma.player.create({
    data: {
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      primaryPosition: normalized.primaryPosition,
    },
  });
}

export async function createPlayer(
  _prevState: CreatePlayerState,
  formData: FormData
): Promise<CreatePlayerState> {
  const session = await auth();

  debug("players", "Soumission du formulaire d'ajout de joueur", {
    userId: session?.user?.id,
    role: session?.user?.role,
  });

  if (!session?.user?.id) {
    debug("players", "Utilisateur non authentifié");
    return {
      success: false,
      errors: {},
      message: "Authentification requise pour ajouter un joueur.",
    };
  }

  const role = resolveRole(session.user.role);
  if (!role || !hasPermission(role, PERMISSIONS["players:create"])) {
    debug("players", "Permission insuffisante", {
      userId: session.user.id,
      role: session.user.role,
    });
    return {
      success: false,
      errors: {},
      message: "Vous n'avez pas l'autorisation d'ajouter un joueur.",
    };
  }

  const candidate = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    primaryPosition: String(formData.get("primaryPosition") ?? "").trim(),
  } satisfies Record<string, unknown>;

  const parsed = createPlayerSchema.safeParse(candidate);

  if (!parsed.success) {
    debug("players", "Validation du formulaire échouée", {
      issues: parsed.error.issues,
    });
    const fieldErrors: CreatePlayerState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "firstName" || field === "lastName" || field === "primaryPosition") {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      success: false,
      errors: fieldErrors,
      message: "Impossible d'ajouter le joueur. Corrigez les erreurs ci-dessous.",
    };
  }

  try {
    await persistPlayer(parsed.data);
  } catch (error) {
    console.error("Failed to create player", error);
    debug("players", "Erreur lors de la création du joueur", {
      userId: session.user.id,
    });
    return {
      success: false,
      errors: {},
      message: "Une erreur est survenue lors de l'ajout du joueur.",
    };
  }

  revalidatePath("/players");

  debug("players", "Joueur créé et cache révalidé", {
    userId: session.user.id,
  });

  return {
    success: true,
    errors: {},
    message: "Joueur ajouté avec succès.",
  };
}
