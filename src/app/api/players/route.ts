import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const players = await prisma.player.findMany();
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const player = await prisma.player.create({ data });
  return NextResponse.json(player, { status: 201 });
}
