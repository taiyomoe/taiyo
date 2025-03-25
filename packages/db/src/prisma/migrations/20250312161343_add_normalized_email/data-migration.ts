import type { Prisma } from "@prisma/client"
import normalizeEmail from "validator/lib/normalizeEmail"

export default async (tx: Prisma.TransactionClient) => {
  const users = await tx.$queryRaw<
    { id: string; email: string | null }[]
  >`SELECT "id", "email" FROM "User"`

  for (const user of users) {
    const normalizedEmail = user.email ? normalizeEmail(user.email) : null

    if (normalizedEmail === false) {
      throw new Error(`Failed to normalize email for user ${user.id}`)
    }

    await tx.$executeRaw`UPDATE "User" SET "normalizedEmail" = ${normalizedEmail || null} WHERE "id" = ${user.id}::UUID`
  }
}
