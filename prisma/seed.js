const { PrismaClient } = require("@prisma/client");
const { ensureRoles, ensureAdminAccount } = require("../scripts/utils/admin-account");
const { loadEnv } = require("../scripts/utils/env");

loadEnv();

const prisma = new PrismaClient();

async function runSeed() {
  await ensureRoles(prisma);

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminDisplayName = process.env.SEED_ADMIN_NAME;

  if (!adminEmail || !adminPassword) {
    console.info(
      "[seed] SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not provided: skipping admin account creation.",
    );
    return;
  }

  const result = await ensureAdminAccount(prisma, {
    email: adminEmail,
    password: adminPassword,
    displayName: adminDisplayName,
  });

  console.info(
    `[seed] Admin account ready for ${result.normalizedEmail} (username: ${result.username}).`,
  );
}

runSeed()
  .catch((error) => {
    console.error("[seed] Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
