import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { persistPlayer, createPlayerSchema } from "@/app/players/actions";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/rbac";

const ROLE_VALUES = Object.values(ROLES) as Role[];

export async function GET() {
  const players = await prisma.player.findMany();
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const session = await auth();

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
