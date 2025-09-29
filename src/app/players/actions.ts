"use server";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/rbac";
import {
  createPlayerSchema,
  normalizePlayerInput,
  type CreatePlayerInput,
} from "@/lib/players";

import type { CreatePlayerState } from "./state";

const ROLE_VALUES = Object.values(ROLES) as Role[];

function resolveRole(value: string | undefined | null): Role | null {
  if (!value) {
    return null;
  }
  return ROLE_VALUES.includes(value as Role) ? (value as Role) : null;
}

export async function persistPlayer(
  input: CreatePlayerInput,
  creatorId: string
) {
  const normalized = normalizePlayerInput(input);

  return prisma.player.create({
    data: {
      name: normalized.name,
      position: normalized.position.toUpperCase(),
      creatorId,
    },
  });
}

export async function createPlayer(
  _prevState: CreatePlayerState,
  formData: FormData
): Promise<CreatePlayerState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      errors: {},
      message: "Authentification requise pour ajouter un joueur.",
    };
  }

  const role = resolveRole(session.user.role);
  if (!role || !hasPermission(role, PERMISSIONS["players:create"])) {
    return {
      success: false,
      errors: {},
      message: "Vous n'avez pas l'autorisation d'ajouter un joueur.",
    };
  }

  const candidate = {
    name: String(formData.get("name") ?? "").trim(),
    position: String(formData.get("position") ?? "").trim(),
  } satisfies Record<string, unknown>;

  const parsed = createPlayerSchema.safeParse(candidate);

  if (!parsed.success) {
    const fieldErrors: CreatePlayerState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "position") {
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
    await persistPlayer(parsed.data, session.user.id);
  } catch (error) {
    console.error("Failed to create player", error);
    return {
      success: false,
      errors: {},
      message: "Une erreur est survenue lors de l'ajout du joueur.",
    };
  }

  revalidatePath("/players");

  return {
    success: true,
    errors: {},
    message: "Joueur ajouté avec succès.",
  };
}
