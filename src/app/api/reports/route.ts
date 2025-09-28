import { NextRequest, NextResponse } from "next/server";
 test
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


import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateReportPayload = {
  playerId: string;
  title: string;
  content: string;
  rating?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: string;
  matchDate?: Date;
};

type ValidationResult =
  | { success: true; data: CreateReportPayload }
  | {
      success: false;
      fieldErrors: Record<string, string[]>;
      formErrors: string[];
    };

const TITLE_MAX_LENGTH = 255;
const TEXTAREA_MAX_LENGTH = 5000;

function validateCreateReportPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return {
      success: false,
      fieldErrors: {},
      formErrors: ["Invalid payload"],
    };
  }

  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];
  const data: Partial<CreateReportPayload> = {};
  const payload = body as Record<string, unknown>;

  const playerId = payload.playerId;
  if (typeof playerId !== "string" || playerId.trim().length === 0) {
    fieldErrors.playerId = ["playerId is required"];
  } else {
    data.playerId = playerId.trim();
  }

  const title = payload.title;
  if (typeof title !== "string" || title.trim().length === 0) {
    fieldErrors.title = ["title is required"];
  } else if (title.trim().length > TITLE_MAX_LENGTH) {
    fieldErrors.title = ["title is too long"];
  } else {
    data.title = title.trim();
  }

  const content = payload.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    fieldErrors.content = ["content is required"];
  } else {
    data.content = content.trim();
  }

  const rating = payload.rating;
  if (rating !== undefined) {
    if (typeof rating !== "number" || !Number.isInteger(rating)) {
      fieldErrors.rating = ["rating must be an integer"];
    } else if (rating < 0 || rating > 10) {
      fieldErrors.rating = ["rating must be between 0 and 10"];
    } else {
      data.rating = rating;
    }
  }

  const mapOptionalTextField = (field: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (typeof value !== "string") {
      fieldErrors[field] = [`${field} must be a string`];
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length > TEXTAREA_MAX_LENGTH) {
      fieldErrors[field] = [`${field} is too long`];
      return;
    }

    if (trimmed.length > 0) {
      (data as Record<string, unknown>)[field] = trimmed;
    }
  };

  mapOptionalTextField("strengths", payload.strengths);
  mapOptionalTextField("weaknesses", payload.weaknesses);
  mapOptionalTextField("recommendation", payload.recommendation);

  const matchDate = payload.matchDate;
  if (matchDate !== undefined && matchDate !== null) {
    const candidate =
      matchDate instanceof Date ? matchDate : new Date(matchDate as string);
    if (Number.isNaN(candidate.getTime())) {
      fieldErrors.matchDate = ["matchDate must be a valid date"];
    } else {
      data.matchDate = candidate;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors, formErrors };
  }

  return { success: true, data: data as CreateReportPayload };
}
 
// GET /api/reports -> list reports for the authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reports = await prisma.report.findMany({
      where: { authorId: session.user.id },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("[Reports] Failed to fetch reports", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/reports  -> créer un rapport (draft)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    console.warn("[Reports] Invalid JSON payload", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validationResult = validateCreateReportPayload(body);
  if (!validationResult.success) {
    const { fieldErrors, formErrors } = validationResult;
    return NextResponse.json(
      { error: "Invalid payload", fieldErrors, formErrors },
      { status: 400 }
    );
  }

  const { playerId, matchDate, ...rest } = validationResult.data;

  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        ...rest,
        matchDate: matchDate ?? undefined,
        authorId: session.user.id,
        playerId,
      },
    });

    console.info(
      `[Reports] Report ${report.id} created by ${session.user.id} for player ${playerId}`
    );

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("[Reports] Failed to create report", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

}
