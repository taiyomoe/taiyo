import type { PrismaClient } from "@prisma/client"
import type { UsersIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { omit, parallel } from "radash"
import { meilisearchClient } from "../"

const getItem = async (db: PrismaClient, id: string) => {
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

const sync = async (db: PrismaClient, ids: string[]) => {
  const users = await parallel(10, ids, (id) => getItem(db, id))

  return meilisearchClient.users.updateDocuments(users)
}

export const UsersIndexService = {
  getItem,
  sync,
}
