import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Token manquant", { status: 400 });
  }

  const verification = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verification) {
    return new NextResponse("Token invalide", { status: 400 });
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { userId: verification.userId } });
    return new NextResponse("Token expiré", { status: 400 });
  }

  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
    },
  });

  await prisma.emailVerificationToken.delete({ where: { userId: verification.userId } });

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}
