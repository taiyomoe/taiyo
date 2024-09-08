import type { PrismaClient } from "@prisma/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { parallel } from "radash"
import { meilisearchClient } from "../"

const getItem = async (db: PrismaClient, id: string) => {
  const result = await db.media.findUnique({
    select: {
      id: true,
      synopsis: true,
      type: true,
      titles: {
        select: {
          title: true,
          language: true,
          priority: true,
          isAcronym: true,
          isMainTitle: true,
        },
      },
      covers: {
        select: { id: true },
        where: { isMainCover: true },
      },
    },
    where: { id },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Media '${id}' not found`,
    })
  }

  if (!result.covers.length) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Media '${id}' has no main cover`,
    })
  }

  return {
    id: result.id,
    synopsis: result.synopsis,
    type: result.type,
    titles: result.titles,
    mainCoverId: result.covers[0]!.id,
  } satisfies MediasIndexItem
}

const sync = async (db: PrismaClient, ids: string[]) => {
  const chapters = await parallel(10, ids, (id) => getItem(db, id))

  return meilisearchClient.chapters.updateDocuments(chapters)
}

export const MediasIndexService = {
  getItem,
  sync,
}
