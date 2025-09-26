/**
 * @file Initialisation du client Prisma.
 * @description Ce fichier est responsable de l'instanciation et de l'exportation du client Prisma.
 * Il utilise un singleton global en environnement de développement pour éviter de créer de nouvelles connexions
 * à la base de données à chaque rechargement à chaud (hot-reloading).
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
