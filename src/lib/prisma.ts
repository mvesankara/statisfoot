/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file Initialisation du client Prisma.
 * @description Ce fichier est responsable de l'instanciation et de l'exportation du client Prisma.
 * Il utilise un singleton global en environnement de développement pour éviter de créer de nouvelles connexions
 * à la base de données à chaque rechargement à chaud (hot-reloading).
 */
import * as prismaPackage from "@prisma/client";

type PrismaClient = {
  [key: string]: any;
  $queryRawUnsafe<T = unknown>(query: string, ...params: unknown[]): Promise<T>;
  $queryRaw<T = unknown>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T>;
  $executeRawUnsafe(query: string, ...params: unknown[]): Promise<unknown>;
  $extends(extension: unknown): PrismaClient;
};

const { PrismaClient: PrismaClientConstructor, UserRoleEnum } = prismaPackage as {
  PrismaClient: new (...args: unknown[]) => PrismaClient;
  UserRoleEnum: Record<string, string>;
};

type BootstrapGlobals = {
  prisma?: PrismaClient;
  prismaWithBootstrap?: PrismaClient;
  prismaBootstrapPromise?: Promise<void>;
};

const globalForPrisma = globalThis as unknown as BootstrapGlobals;

/**
 * @const {PrismaClient} prisma
 * @description Instance unique du client Prisma.
 * En développement, elle est stockée dans une variable globale pour persister entre les rechargements.
 * En production, une nouvelle instance est créée.
 * Les logs de requêtes sont activés en développement.
 */
const missingDatabaseUrl = !process.env.DATABASE_URL;
if (missingDatabaseUrl) {
  console.warn(
    "DATABASE_URL n'est pas défini. Prisma utilisera un client de substitution qui rejette toutes les opérations."
  );
}

function createRejectingDelegate(): any {
  const reject = async () => {
    throw new Error("DATABASE_URL n'est pas configurée pour cette opération Prisma.");
  };

  return new Proxy(reject, {
    apply: () => reject(),
    get: () => createRejectingDelegate(),
  });
}

function createPrismaStub(): PrismaClient {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === "$extends") {
          return () => createPrismaStub();
        }
        return createRejectingDelegate();
      },
    }
  ) as PrismaClient;
}

const basePrismaClient =
  globalForPrisma.prisma ??
  (missingDatabaseUrl
    ? createPrismaStub()
    : new PrismaClientConstructor({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }));

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

function escapeLiteral(value: string): string {
  return value.replace(/'/g, "''");
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

async function ensureUserRoleEnumValues(
  client: PrismaClient,
  provider: SupportedProvider,
): Promise<void> {
  if (provider !== "postgresql") return;

  const schema = resolvePostgresSchema(process.env.DATABASE_URL);
  const enumName = "UserRoleEnum";

  const existingValues = await client.$queryRaw<Array<{ enumlabel: string }>>`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = ${schema} AND t.typname = ${enumName}
  `;

  const existingLabels = new Set(existingValues.map((row) => row.enumlabel));
  const missingValues = Object.values(UserRoleEnum).filter(
    (value) => !existingLabels.has(value),
  );

  if (missingValues.length === 0) return;

  const escapedSchema = escapeIdentifier(schema);
  const escapedEnumName = escapeIdentifier(enumName);

  for (const value of missingValues) {
    await client.$executeRawUnsafe(
      `ALTER TYPE "${escapedSchema}"."${escapedEnumName}" ADD VALUE IF NOT EXISTS '${escapeLiteral(value)}'`,
    );
  }
}

async function ensureRolesExist(client: PrismaClient): Promise<void> {
  const roleValues = Object.values(UserRoleEnum);

  await Promise.all(
    roleValues.map(async (roleName) => {
      await client.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
    }),
  );
}

async function bootstrapDatabase(client: PrismaClient): Promise<void> {
  const provider = inferProvider(process.env.DATABASE_URL);
  await ensureEmailVerificationColumns(client, provider);
  await ensureUserRoleEnumValues(client, provider);
  await ensureRolesExist(client);
}

const bootstrapPromise = missingDatabaseUrl
  ? Promise.resolve()
  : globalForPrisma.prismaBootstrapPromise ??
    bootstrapDatabase(basePrismaClient).catch((error) => {
      console.error("Failed to bootstrap Prisma dependencies", error);
      throw error;
    });

if (!missingDatabaseUrl && !globalForPrisma.prismaBootstrapPromise) {
  globalForPrisma.prismaBootstrapPromise = bootstrapPromise;
}

const prismaWithBootstrap = missingDatabaseUrl
  ? basePrismaClient
  : globalForPrisma.prismaWithBootstrap ??
    basePrismaClient.$extends({
      query: {
        $allModels: {
          async $allOperations({
            args,
            query,
          }: {
            args: any;
            query: (args: any) => Promise<any>;
          }) {
            await bootstrapPromise;
            return query(args);
          },
        },
      },
    });

if (!missingDatabaseUrl && !globalForPrisma.prismaWithBootstrap) {
  globalForPrisma.prismaWithBootstrap = prismaWithBootstrap;
}

if (process.env.NODE_ENV !== "production" && !globalForPrisma.prisma) {
  globalForPrisma.prisma = basePrismaClient;
}

export const prisma = prismaWithBootstrap;
