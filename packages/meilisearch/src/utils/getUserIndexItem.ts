import type { PrismaClient } from "@prisma/client"
import type { UsersIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { omit } from "radash"

export const getUserIndexItem = async (
  db: PrismaClient,
  userId: string,
): Promise<UsersIndexItem> => {
  const result = await db.user.findUnique({
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      profile: { select: { about: true } },
    },
    where: { id: userId },
  })

  if (!result || !result.profile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `User '${userId}' not found`,
    })
  }

  return {
    ...omit(result, ["profile"]),
    about: result.profile.about,
  }
}
