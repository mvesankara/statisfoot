import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/reports/:id/submit -> submit a report
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(auth);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const report = await prisma.report.update({
    where: { id: params.id },
    data: { status: "submitted" },
  });
  return NextResponse.json(report);
}
