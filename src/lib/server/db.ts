import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

import { env } from "~/lib/env.mjs";

const getExtendedClient = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());
};
export type ExtendedPrismaClient = ReturnType<typeof getExtendedClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? getExtendedClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
