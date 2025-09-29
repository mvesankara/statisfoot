import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { hasPermission, PERMISSIONS } from "@/lib/rbac";
import { createPlayerSchema, normalizePlayerInput } from "@/lib/players";
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
  permission: keyof typeof PERMISSIONS
) {
  const role = session?.user?.role as Role | undefined;
  const userId = session?.user?.id;
  if (!role || !userId) {
    return null;
  }

  if (!hasPermission(role, permission)) {
    return null;
  }

  return { userId, role };
}

import { persistPlayer, createPlayerSchema } from "@/app/players/actions";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/rbac";

const ROLE_VALUES = Object.values(ROLES) as Role[];


export async function GET() {
  const session = await auth();
  const authUser = getAuthorizedUser(session, PERMISSIONS["players:read"]);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const players = await prisma.player.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, position: true, createdAt: true },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("[Players] Failed to list players", error);
    return NextResponse.json(
      { error: "Impossible de récupérer la liste des joueurs." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {

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


  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role =
    session.user.role && ROLE_VALUES.includes(session.user.role as Role)
      ? (session.user.role as Role)
      : null;

  if (!role || !hasPermission(role, PERMISSIONS["players:create"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  const candidate = {
    name:
      typeof body.name === "string"
        ? body.name.trim()
        : body.name,
    position:
      typeof body.position === "string"
        ? body.position.trim()
        : body.position,
  };

  const parsed = createPlayerSchema.safeParse(candidate);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
      }
    }

    return NextResponse.json(
      { error: "Invalid payload", fieldErrors },

      { status: 400 }
    );
  }

  const data = normalizePlayerInput(parsed.data);

  try {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        position: data.position,
        creatorId: authUser.userId,
      },
      select: { id: true, name: true, position: true, createdAt: true },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("[Players] Failed to create player", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce joueur." },

  try {
    const player = await persistPlayer(parsed.data, session.user.id);
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Failed to create player", error);
    return NextResponse.json(
      { error: "Unable to create player" },

      { status: 500 }
    );
  }
}
