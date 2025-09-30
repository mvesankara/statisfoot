import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS, type AppRole } from "@/lib/rbac";
import {
  createPlayerSchema,
  normalizePlayerInput,
  formatPlayerName,
} from "@/lib/players";
import type { ZodIssue } from "@/lib/zod";

type Session = Awaited<ReturnType<typeof auth>>;

type FieldErrors = Record<string, string[]>;

function buildFieldErrors(issues: ZodIssue[]): FieldErrors {
  const result: FieldErrors = {};

  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) {
      result[key] = [];
    }
    result[key]!.push(issue.message);
  }

  return result;
}

function getAuthorizedUser(
  session: Session,
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
) {
  const role = session?.user?.role as AppRole | null | undefined;
  const userId = session?.user?.id;

  if (!role || !userId) {
    return null;
  }

  if (!hasPermission(role, permission as keyof typeof PERMISSIONS)) {
    return null;
  }

  return { userId, role };
}

export async function GET() {
  const session = await auth();
  const authUser = getAuthorizedUser(session, PERMISSIONS["players:read"]);

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const players = await prisma.player.findMany({
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        primaryPosition: true,
      },
    });

    const payload = players.map((player) => ({
      ...player,
      fullName: formatPlayerName(player.firstName, player.lastName),
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[Players] Failed to list players", error);
    return NextResponse.json(
      { error: "Impossible de récupérer la liste des joueurs." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const authUser = getAuthorizedUser(session, PERMISSIONS["players:create"]);

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const parsed = createPlayerSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = buildFieldErrors(parsed.error.issues);
    return NextResponse.json(
      { error: "Validation échouée.", fieldErrors },
      { status: 400 }
    );
  }

  const normalized = normalizePlayerInput(parsed.data);

  try {
    const player = await prisma.player.create({
      data: {
        firstName: normalized.firstName,
        lastName: normalized.lastName,
        primaryPosition: normalized.primaryPosition,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        primaryPosition: true,
      },
    });

    return NextResponse.json(
      {
        ...player,
        fullName: formatPlayerName(player.firstName, player.lastName),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Players] Failed to create player", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce joueur." },
      { status: 500 }
    );
  }
}
