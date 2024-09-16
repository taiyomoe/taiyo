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

export const CoversService = {
  postUpload,
}
