// POST /api/players -> créer (scout ou admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const player = await prisma.player.create({
    data: { ...data, creatorId: session.user.id },
  });
  return NextResponse.json(player);
}
