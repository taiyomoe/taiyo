import type { Prisma, PrismaClient } from "@taiyomoe/db"
import type { UsersIndexItem } from "@taiyomoe/types"
import { omit } from "radash"

export const getUserIndexItem = async (
  db: PrismaClient | Prisma.TransactionClient,
  id: string,
) => {
  const result = await db.user.findUnique({
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      profile: { select: { about: true } },
    },
    where: { id },
  })

  if (!result || !result.profile) {
    throw new Error(`User '${id}' not found`)
  }

  return {
    ...omit(result, ["profile"]),
    about: result.profile.about,
  } satisfies UsersIndexItem
}
