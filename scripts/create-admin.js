#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");
const { ensureRoles, ensureAdminAccount, normalizeEmail } = require("./utils/admin-account");
const { loadEnv } = require("./utils/env");

loadEnv();

const prisma = new PrismaClient();

function parseArgs(argv) {
  const [, , ...rest] = argv;
  let email = "";
  let password = "";
  let displayName = "";
  let help = false;

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (!value) continue;

    if (value === "--help" || value === "-h") {
      help = true;
      continue;
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

    if (value.startsWith("--password=")) {
      password = value.split("=").slice(1).join("=");
      continue;
    }

    if (value === "--password") {
      password = rest[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (value.startsWith("--name=")) {
      displayName = value.split("=").slice(1).join("=");
      continue;
    }

    if (value === "--name") {
      displayName = rest[index + 1] ?? "";
      index += 1;
      continue;
    }
  }

  return {
    email: normalizeEmail(email),
    password,
    displayName: displayName?.trim() ?? "",
    help,
  };
}

function printHelp() {
  console.info("Usage : npm run create:admin -- --email <adresse> --password <mot_de_passe> [--name <Nom Affiché>]");
  console.info("Crée ou met à jour un compte administrateur et lui assigne le rôle ADMIN.");
}

async function main() {
  const { email, password, displayName, help } = parseArgs(process.argv);

  if (help) {
    printHelp();
    return;
  }

  if (!email) {
    console.error("[create-admin] L'option --email est obligatoire.");
    process.exitCode = 1;
    return;
  }

  if (!password) {
    console.error("[create-admin] L'option --password est obligatoire.");
    process.exitCode = 1;
    return;
  }

  try {
    await ensureRoles(prisma);
    const result = await ensureAdminAccount(prisma, {
      email,
      password,
      displayName,
    });

    console.info(
      `[create-admin] Admin account ready for ${result.normalizedEmail} (username: ${result.username}).`,
    );
  } catch (error) {
    console.error("[create-admin] Erreur lors de la création du compte administrateur", error);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("[create-admin] Erreur inattendue", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
