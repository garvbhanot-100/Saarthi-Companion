import { PrismaClient } from "@prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set (Supabase → Database → Connection string URI).",
  );
}

/** Used for Postgres LISTEN / real-time SSE (Supabase is still Postgres). */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export { PrismaClient };
export type {
  Prisma,
  SaarthiUser,
  SaarthiChat,
  SaarthiChatMessage,
  SaarthiPayment,
} from "@prisma/client";
