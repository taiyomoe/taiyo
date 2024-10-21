import { cacheClient } from "@taiyomoe/cache"
import {
  type MediaCover,
  type Prisma,
  type PrismaClient,
  db,
} from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { MediasIndexService } from "@taiyomoe/meilisearch/services"
import { ObjectUtils } from "@taiyomoe/utils"

const postUpload = async (
  db: PrismaClient | Prisma.TransactionClient,
  type: "created" | "imported" | "synced",
  covers: MediaCover[],
) => {
  const uniqueMediaIds = Array.from(new Set(covers.map((c) => c.mediaId)))
  const hasMainCover = covers.some((c) => c.isMainCover)

  for (const cover of covers) {
    await logsClient.covers.insert({
      type,
      _new: cover,
      userId: cover.uploaderId,
    })
  }

  if (hasMainCover) {
    await MediasIndexService.sync(db, uniqueMediaIds)
    await cacheClient.medias.invalidateAll()
  }
}

const postUpdate = async (
  oldCover: MediaCover,
  newCover: MediaCover,
  userId: string,
) => {
  if (ObjectUtils.areEqualTimed(oldCover, newCover)) {
    return
  }

  await logsClient.covers.insert({
    type: "updated",
    old: oldCover,
    _new: newCover,
    userId,
  })

  if (newCover.isMainCover) {
    await MediasIndexService.sync(db, [newCover.mediaId])
    await cacheClient.medias.invalidateAll()
  }
}

/**
 * Main covers cannot be deleted, so there is no need to
 * reindex the medias or invalidate the cache.
 */
const postDelete = async (covers: MediaCover[]) => {
  for (const cover of covers) {
    await logsClient.covers.insert({
      type: "deleted",
      old: cover,
      userId: cover.deleterId!,
    })
  }
}

export const BaseCoversService = {
  postUpload,
  postUpdate,
  postDelete,
}
