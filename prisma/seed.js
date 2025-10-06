const { PrismaClient, UserRoleEnum } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const roleValues = Object.values(UserRoleEnum);

function buildBaseUsername(email) {
  const [localPart = ""] = email.split("@");
  const sanitized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");
  return sanitized || "admin";
}

async function findAvailableUsername(base) {
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
}

function buildDisplayName(email, fallbackUsername) {
  const [localPart = ""] = email.split("@");
  if (localPart) {
    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return fallbackUsername.charAt(0).toUpperCase() + fallbackUsername.slice(1);
}

async function ensureRoles() {
  for (const roleName of roleValues) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
}

async function ensureAdminAccount() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminDisplayName = process.env.SEED_ADMIN_NAME;

  if (!adminEmail || !adminPassword) {
    console.info(
      "[seed] SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not provided: skipping admin account creation.",
    );
    return;
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();
  const baseUsername = buildBaseUsername(normalizedEmail);
  const username = await findAvailableUsername(baseUsername);
  const displayName = adminDisplayName?.trim() || buildDisplayName(normalizedEmail, username);
  const hashedPass = await hash(adminPassword, 10);

  const adminRole = await prisma.role.findUnique({ where: { name: UserRoleEnum.ADMIN } });
  if (!adminRole) {
    throw new Error("ADMIN role is missing from the Role table. Run ensureRoles() first.");
  }

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      hashedPass,
      displayName,
      disabledAt: null,
      emailVerified: new Date(),
    },
    create: {
      email: normalizedEmail,
      username,
      displayName,
      hashedPass,
      emailVerified: new Date(),
      roles: {
        create: {
          role: { connect: { id: adminRole.id } },
        },
      },
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  console.info(`[seed] Admin account ready for ${normalizedEmail}`);
}

async function main() {
  await ensureRoles();
  await ensureAdminAccount();
}

main()
  .catch((error) => {
    console.error("[seed] Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
