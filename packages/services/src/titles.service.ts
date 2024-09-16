import { cacheClient } from "@taiyomoe/cache"
import { type MediaTitle, db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { MediasIndexService } from "@taiyomoe/meilisearch/services"

const postCreate = async (
  type: "created" | "imported" | "synced",
  title: MediaTitle,
  userId: string,
) => {
  await logsClient.titles.insert({
    type,
    _new: title,
    userId,
  })

  await MediasIndexService.sync(db, [title.mediaId])

  if (title.isMainTitle) {
    await cacheClient.medias.featured(title.language).invalidate()
  }
}

const postUpdate = async (
  type: "updated" | "synced",
  oldTitle: MediaTitle,
  newTitle: MediaTitle,
  userId: string,
) => {
  await logsClient.titles.insert({
    type,
    old: oldTitle,
    _new: newTitle,
    userId,
  })

  await MediasIndexService.sync(db, [newTitle.mediaId])

  if (newTitle.isMainTitle) {
    await cacheClient.medias.featured(newTitle.language).invalidate()
  }
}

const postDelete = async (title: MediaTitle, userId: string) => {
  await logsClient.titles.insert({
    type: "deleted",
    old: title,
    userId,
  })

  await MediasIndexService.sync(db, [title.mediaId])
  await cacheClient.medias.invalidateAll()
}

export const TitlesService = {
  postCreate,
  postUpdate,
  postDelete,
}
