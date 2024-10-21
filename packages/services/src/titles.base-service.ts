import { cacheClient } from "@taiyomoe/cache"
import {
  type MediaTitle,
  type Prisma,
  type PrismaClient,
  db,
} from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { MediasIndexService } from "@taiyomoe/meilisearch/services"
import { ObjectUtils } from "@taiyomoe/utils"

const postCreate = async (
  db: PrismaClient | Prisma.TransactionClient,
  type: "created" | "imported" | "synced",
  titles: MediaTitle[],
) => {
  const uniqueMediaIds = Array.from(new Set(titles.map((t) => t.mediaId)))
  const mainTitle = titles.find((t) => t.isMainTitle)

  for (const title of titles) {
    await logsClient.titles.insert({
      type,
      _new: title,
      userId: title.creatorId,
    })
  }

  await MediasIndexService.sync(db, uniqueMediaIds)

  if (mainTitle) {
    await cacheClient.medias.featured(mainTitle.language).invalidate()
  }
}

const postUpdate = async (
  db: PrismaClient | Prisma.TransactionClient,
  type: "updated" | "synced",
  oldTitle: MediaTitle,
  newTitle: MediaTitle,
  userId: string,
) => {
  if (ObjectUtils.areEqualTimed(oldTitle, newTitle)) {
    return
  }

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

export const BaseTitlesService = {
  postCreate,
  postUpdate,
  postDelete,
}
