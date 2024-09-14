import type { PrismaClient } from "@prisma/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, parallel } from "radash"
import { meilisearchClient } from "../"

const getItem = async (db: PrismaClient, id: string) => {
  const result = await db.media.findUnique({
    include: {
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
    ...omit(result, [
      "createdAt",
      "updatedAt",
      "deletedAt",
      "startDate",
      "endDate",
      "covers",
    ]),
    createdAt: DateTime.fromJSDate(result.createdAt).toSeconds(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).toSeconds(),
    deletedAt: result.deletedAt
      ? DateTime.fromJSDate(result.deletedAt).toSeconds()
      : null,
    startDate: result.startDate
      ? DateTime.fromJSDate(result.startDate).toSeconds()
      : null,
    endDate: result.endDate
      ? DateTime.fromJSDate(result.endDate).toSeconds()
      : null,
    mainCoverId: result.covers[0]!.id,
  } satisfies MediasIndexItem
}

const sync = async (db: PrismaClient, ids: string[]) => {
  const medias = await parallel(10, ids, (id) => getItem(db, id))

  return meilisearchClient.medias.updateDocuments(medias)
}

export const MediasIndexService = {
  getItem,
  sync,
}
