import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/reports  -> créer un rapport (draft)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { playerId, title, content } = await req.json();
  const report = await prisma.report.create({
    data: {
      authorId: session.user.id,
      playerId,
      title,
      content,
    },
  });

  return NextResponse.json(report);
}

// PUT /api/reports/:id -> mise à jour
export async function PUT(req: NextRequest) {
  const { id, title, content } = await req.json();
  const report = await prisma.report.update({
    where: { id },
    data: { title, content },
  });
  return NextResponse.json(report);
}

// POST /api/reports/:id/submit -> soumettre
export async function POST_submit(req: NextRequest) {
  const { id } = await req.json();
  const report = await prisma.report.update({
    where: { id },
    data: { status: "submitted" },
  });
  return NextResponse.json(report);
}
