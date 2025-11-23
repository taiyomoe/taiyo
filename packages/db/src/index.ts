import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "./env"
import { PrismaClient } from "./generated/prisma/client"

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
    datasourceUrl: env.DATABASE_URL,
    adapter,
    log:
      process.env.NODE_ENV === "development" && !process.env.PRISMA_SEED
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

export * from "./generated/prisma/client"
export * from "./generated/prisma/sql"
