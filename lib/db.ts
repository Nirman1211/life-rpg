import { PrismaClient } from "@prisma/client";

const NEON_DEFAULT_URL =
  "postgresql://neondb_owner:npg_VL7DRX3fvOJN@ep-restless-waterfall-b3hi7n8t-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Fallback if DATABASE_URL is missing or empty string on serverless host
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = NEON_DEFAULT_URL;
}

const activeUrl = process.env.DATABASE_URL || NEON_DEFAULT_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Cache Prisma client across serverless lambda invocations to reuse connection pools
globalForPrisma.prisma = prisma;

export default prisma;
