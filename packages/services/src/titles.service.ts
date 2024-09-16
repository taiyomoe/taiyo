import { cacheClient } from "@taiyomoe/cache"
import { type MediaTitle, db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { MediasIndexService } from "@taiyomoe/meilisearch/services"

const postCreate = async (
  type: "created" | "imported" | "synced",
  titles: MediaTitle[],
) => {
  const uniqueMediaIds = Array.from(new Set(titles.map((t) => t.mediaId)))
  const mainTitle = titles.find((t) => t.isMainTitle)
  const userId = titles.at(0)!.creatorId

  for (const title of titles) {
    await logsClient.titles.insert({
      type,
      _new: title,
      userId,
    })
  }

  await MediasIndexService.sync(db, uniqueMediaIds)

  if (mainTitle) {
    await cacheClient.medias.featured(mainTitle.language).invalidate()
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

const postDelete = async (title: MediaTitle) => {
  await logsClient.titles.insert({
    type: "deleted",
    old: title,
    userId: title.deleterId!,
  })

  await MediasIndexService.sync(db, [title.mediaId])
  await cacheClient.medias.invalidateAll()
}

export const TitlesService = {
  postCreate,
  postUpdate,
  postDelete,
}
