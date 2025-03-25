import type { Prisma, PrismaClient } from "@prisma/client"
import type { UsersIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
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
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `User '${id}' not found`,
    })
  }

  return {
    ...omit(result, ["profile"]),
    about: result.profile.about,
  } satisfies UsersIndexItem
}
