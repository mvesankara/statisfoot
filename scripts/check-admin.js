#!/usr/bin/env node
/* eslint-disable no-console */

const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

function normalizeEmail(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function parseArgs(argv) {
  const [, , ...rest] = argv;
  let email = "";

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (!value) continue;

    if (value === "--help" || value === "-h") {
      return { email: "", help: true };
    }

    if (value.startsWith("--email=")) {
      email = value.split("=").slice(1).join("=");
      continue;
    }

    if (value === "--email") {
      email = rest[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (!email) {
      email = value;
    }
  }

  return { email: normalizeEmail(email), help: false };
}

async function reportAdminStatus(email) {
  if (!email) {
    console.error("[check-admin] Aucun email fourni. Utilisez --email <adresse>.");
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    console.error(`[check-admin] Aucun utilisateur trouvé pour ${email}.`);
    process.exitCode = 1;
    return;
  }

  const primaryRole = user.roles[0]?.role?.name ?? null;
  const hasAdminRole = user.roles.some((record) => record.role?.name === "ADMIN");

  if (hasAdminRole) {
    console.info(
      `[check-admin] L'utilisateur ${email} possède le rôle ADMIN (rôle principal actuel : ${primaryRole ?? "inconnu"}).`,
    );
  } else {
    const listedRoles = user.roles.map((record) => record.role?.name).filter(Boolean);
    console.error(
      `[check-admin] L'utilisateur ${email} n'a pas le rôle ADMIN. Rôles actuels : ${listedRoles.join(", ") || "aucun"}.`,
    );
    process.exitCode = 1;
  }
}

async function main() {
  const { email, help } = parseArgs(process.argv);

  if (help) {
    console.info("Usage : npm run check:admin -- --email <adresse>");
    console.info("Vérifie qu'un utilisateur possède le rôle ADMIN en base de données.");
    return;
  }

  await reportAdminStatus(email);
}

main()
  .catch((error) => {
    console.error("[check-admin] Erreur inattendue", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
