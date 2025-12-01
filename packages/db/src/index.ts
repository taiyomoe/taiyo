import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "./env"
import { PrismaClient } from "./generated/prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const db =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalThis.prisma = db

export { PrismaPg } from "@prisma/adapter-pg"
export * from "./generated/prisma/client"
export * from "./generated/prisma/sql"
