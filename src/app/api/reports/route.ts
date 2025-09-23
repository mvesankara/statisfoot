 import { NextRequest, NextResponse } from "next/server";
 import { getServerSession } from "next-auth";
 import { auth } from "@/lib/auth";
 import { PrismaClient } from "@prisma/client";
 
 const prisma = new PrismaClient();
 
// GET /api/reports -> list reports for the authenticated user
export async function GET() {
  const session = await getServerSession(auth);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.report.findMany({
    where: { authorId: session.user.id },
  });
  return NextResponse.json(reports);
}

 // POST /api/reports  -> créer un rapport (draft)
 export async function POST(req: NextRequest) {
   const session = await getServerSession(auth);
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
