import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reports -> liste des rapports de l'utilisateur authentifié
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    where: { authorId: session.user.id },
    include: {
      player: {
        select: { id: true, name: true, position: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}

// POST /api/reports -> créer un nouveau rapport
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const playerId = body?.playerId as string | undefined;
  const content = body?.content as string | undefined;
  const status = body?.status as string | undefined;

  if (!playerId || !content) {
    return NextResponse.json(
      { error: "Les champs 'playerId' et 'content' sont obligatoires." },
      { status: 400 },
    );
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { id: true },
  });

  if (!player) {
    return NextResponse.json(
      { error: "Le joueur sélectionné est introuvable." },
      { status: 400 },
    );
  }

  const report = await prisma.report.create({
    data: {
      authorId: session.user.id,
      playerId,
      content,
      status: status && status.length > 0 ? status : undefined,
    },
    include: {
      player: {
        select: { id: true, name: true, position: true },
      },
    },
  });

  return NextResponse.json(report, { status: 201 });
}
