import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Limite le pool Prisma pour ne pas saturer Neon (surtout en dev / plusieurs onglets). */
function databaseUrlWithPoolLimits(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL manquant.");
  }
  if (/[?&]connection_limit=/i.test(url)) {
    return url;
  }
  const limit =
    process.env.NODE_ENV === "production"
      ? process.env.PRISMA_CONNECTION_LIMIT ?? "1"
      : process.env.PRISMA_CONNECTION_LIMIT ?? "3";
  const poolTimeout = process.env.PRISMA_POOL_TIMEOUT ?? "20";
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connection_limit=${limit}&pool_timeout=${poolTimeout}`;
}

/**
 * Un seul client Prisma par processus (évite d'épuiser le pool Neon en dev / HMR).
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrlWithPoolLimits() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
