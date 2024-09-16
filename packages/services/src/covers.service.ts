import { cacheClient } from "@taiyomoe/cache"
import { type MediaCover, db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { MediasIndexService } from "@taiyomoe/meilisearch/services"

const postUpload = async (
  type: "created" | "imported" | "synced",
  covers: MediaCover[],
  userId: string,
) => {
  const uniqueMediaIds = new Set(covers.map((c) => c.mediaId))
  const hasMainCover = covers.some((c) => c.isMainCover)

  for (const cover of covers) {
    await logsClient.covers.insert({
      type,
      _new: cover,
      userId,
    })
  }

  if (hasMainCover) {
    await MediasIndexService.sync(db, Array.from(uniqueMediaIds))
    await cacheClient.medias.invalidateAll()
  }
}

const postUpdate = async (
  oldCover: MediaCover,
  newCover: MediaCover,
  oldMainCover: MediaCover | null,
  userId: string,
) => {
  await logsClient.covers.insert({
    type: "updated",
    old: oldCover,
    _new: newCover,
    userId,
  })

  if (oldMainCover) {
    await logsClient.covers.insert({
      type: "updated",
      old: oldMainCover,
      _new: { ...oldMainCover, isMainCover: false },
      userId,
    })
  }

  if (newCover.isMainCover) {
    await MediasIndexService.sync(db, [newCover.mediaId])
    await cacheClient.medias.invalidateAll()
  }
}

/**
 * Main covers cannot be deleted, so there is no need to
 * reindex the medias or invalidate the cache.
 */
const postDelete = async (covers: MediaCover[], userId: string) => {
  for (const cover of covers) {
    await logsClient.covers.insert({
      type: "deleted",
      old: cover,
      userId,
    })
  }
}

export const CoversService = {
  postUpload,
  postUpdate,
  postDelete,
}
