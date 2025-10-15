import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS, type AppRole } from "@/lib/rbac";

// POST /api/reports/:id/submit -> submit a report
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingReport = await prisma.report.findUnique({
    where: { id: params.id },
    select: { id: true, authorId: true },
  });

  if (!existingReport) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const role = session.user.role as AppRole | undefined;
  const canUpdate =
    existingReport.authorId === session.user.id ||
    (role ? hasPermission(role, PERMISSIONS["reports:update"]) : false);

  if (!canUpdate) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedReport = await prisma.report.update({
    where: { id: params.id },
    data: { status: "published" },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      rating: true,
      strengths: true,
      weaknesses: true,
      recommendation: true,
      matchDate: true,
      createdAt: true,
      player: {
        select: { id: true, name: true, position: true },
      },
    },
  });

  return NextResponse.json({ report: updatedReport });
}
