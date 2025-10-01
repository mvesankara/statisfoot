/**
 * @file Initialisation du client Prisma.
 * @description Ce fichier est responsable de l'instanciation et de l'exportation du client Prisma.
 * Il utilise un singleton global en environnement de développement pour éviter de créer de nouvelles connexions
 * à la base de données à chaque rechargement à chaud (hot-reloading).
 */
import { PrismaClient } from "@prisma/client";

type BootstrapGlobals = {
  prisma?: PrismaClient;
  prismaBootstrapPromise?: Promise<void>;
  prismaBootstrapMiddlewareRegistered?: boolean;
};

const globalForPrisma = globalThis as unknown as BootstrapGlobals;

/**
 * @const {PrismaClient} prisma
 * @description Instance unique du client Prisma.
 * En développement, elle est stockée dans une variable globale pour persister entre les rechargements.
 * En production, une nouvelle instance est créée.
 * Les logs de requêtes sont activés en développement.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

type SupportedProvider = "postgresql" | "sqlite";

function inferProvider(url: string | undefined): SupportedProvider {
  if (!url) return "postgresql";

  const lowered = url.toLowerCase();
  if (lowered.startsWith("file:")) return "sqlite";
  if (lowered.includes(":memory:")) return "sqlite";
  if (lowered.includes("sqlite")) return "sqlite";

  return "postgresql";
}

function escapeIdentifier(identifier: string): string {
  return identifier.replace(/"/g, '""');
}

function resolvePostgresSchema(url: string | undefined): string {
  if (!url) return "public";

  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("schema") ?? "public";
  } catch (error) {
    console.warn("Unable to parse DATABASE_URL, defaulting to public schema", error);
    return "public";
  }
}

async function ensureEmailVerificationColumns(
  client: PrismaClient,
  provider: SupportedProvider,
): Promise<void> {
  if (provider === "sqlite") {
    const columns = (await client.$queryRawUnsafe<Array<{ name: string }>>(
      'PRAGMA table_info("User")',
    )) as Array<{ name: string }>;

    const hasEmailVerified = columns.some((column) => column.name === "emailVerified");
    const hasEmailVerificationToken = columns.some(
      (column) => column.name === "emailVerificationToken",
    );

    if (!hasEmailVerified) {
      await client.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "emailVerified" DATETIME');
    }

    if (!hasEmailVerificationToken) {
      await client.$executeRawUnsafe(
        'ALTER TABLE "User" ADD COLUMN "emailVerificationToken" TEXT',
      );
    }

    await client.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key" ON "User"("emailVerificationToken")',
    );

    return;
  }

  const schema = escapeIdentifier(resolvePostgresSchema(process.env.DATABASE_URL));

  await client.$executeRawUnsafe(`
    ALTER TABLE "${schema}"."User"
    ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT
  `);

  await client.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key"
    ON "${schema}"."User" ("emailVerificationToken")
  `);
}

const bootstrapPromise =
  globalForPrisma.prismaBootstrapPromise ??
  ensureEmailVerificationColumns(prisma, inferProvider(process.env.DATABASE_URL)).catch(
    (error) => {
      console.error("Failed to ensure email verification columns exist", error);
      throw error;
    },
  );

if (!globalForPrisma.prismaBootstrapPromise) {
  globalForPrisma.prismaBootstrapPromise = bootstrapPromise;
}

if (!globalForPrisma.prismaBootstrapMiddlewareRegistered) {
  prisma.$use(async (params, next) => {
    await bootstrapPromise;
    return next(params);
  });
  globalForPrisma.prismaBootstrapMiddlewareRegistered = true;
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
