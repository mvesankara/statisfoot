const { UserRoleEnum } = require("@prisma/client");
const { hash } = require("bcryptjs");

const roleValues = Object.values(UserRoleEnum);

function normalizeEmail(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function buildBaseUsername(email) {
  const [localPart = ""] = email.split("@");
  const sanitized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");
  return sanitized || "admin";
}

async function findAvailableUsername(prisma, base) {
  let candidate = base;
  let suffix = 1;

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

async function ensureRoles(prisma) {
  for (const roleName of roleValues) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
}

async function ensureAdminAccount(prisma, { email, password, displayName }) {
  if (!email || !password) {
    throw new Error("Both email and password are required to create an admin account.");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  let username = existingUser?.username;
  if (!username) {
    const baseUsername = buildBaseUsername(normalizedEmail);
    username = await findAvailableUsername(prisma, baseUsername);
  }

  const resolvedDisplayName =
    displayName?.trim() || existingUser?.displayName || buildDisplayName(normalizedEmail, username);

  const hashedPass = await hash(password, 10);

  const adminRole = await prisma.role.findUnique({ where: { name: UserRoleEnum.ADMIN } });
  if (!adminRole) {
    throw new Error("ADMIN role is missing from the Role table. Run ensureRoles() first.");
  }

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      hashedPass,
      displayName: resolvedDisplayName,
      disabledAt: null,
      emailVerified: existingUser?.emailVerified ?? new Date(),
    },
    create: {
      email: normalizedEmail,
      username,
      displayName: resolvedDisplayName,
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

  return {
    user,
    normalizedEmail,
    username,
    displayName: resolvedDisplayName,
  };
}

module.exports = {
  ensureRoles,
  ensureAdminAccount,
  buildBaseUsername,
  buildDisplayName,
  findAvailableUsername,
  normalizeEmail,
};
