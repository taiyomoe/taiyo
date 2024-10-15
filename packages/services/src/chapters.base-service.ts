import { cacheClient } from "@taiyomoe/cache"
import { type MediaChapter, db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import { ChaptersIndexService } from "@taiyomoe/meilisearch/services"
import { ObjectUtils } from "@taiyomoe/utils"
import { BaseChaptersServiceUtils } from "./utils/chapters-base-service-utils"

const getDistinctCount = async (mediaId: string) => {
  const result = await db.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT "number")
    FROM "MediaChapter"
    WHERE "mediaId" = ${mediaId} AND "deletedAt" IS NULL;
  `

  return result[0].count
}

const postUpload = async (
  type: "created" | "imported" | "synced",
  chapters: MediaChapter[],
) => {
  const ids = chapters.map((c) => c.id)

  console.log("chapters", chapters)

  for (const chapter of chapters) {
    await logsClient.chapters.insert({
      type,
      _new: chapter,
      userId: chapter.uploaderId,
    })
  }

  await ChaptersIndexService.sync(db, ids)

  const cached = await cacheClient.chapters.latest.get()

  if (!cached) {
    return
  }

  const rawLatestReleases = await db.mediaChapter.findMany({
    select: BaseChaptersServiceUtils.latestReleaseQuery,
    where: { id: { in: ids } },
  })

  await cacheClient.chapters.latest.set([...rawLatestReleases, ...cached])
}

const postUpdate = async (
  oldChapters: MediaChapter[],
  newChapters: MediaChapter[],
  userId: string,
) => {
  const ids = oldChapters.map((c) => c.id)

  for (const chapter of oldChapters) {
    const newChapter = newChapters.find((c) => c.id === chapter.id)!

    if (ObjectUtils.areEqualTimed(chapter, newChapter)) {
      continue
    }

    await logsClient.chapters.insert({
      type: "updated",
      old: chapter,
      _new: newChapter,
      userId,
    })
  }

  await ChaptersIndexService.sync(db, ids)
  await cacheClient.chapters.invalidateAll()
}

const postRestore = async (chapters: MediaChapter[], userId: string) => {
  const ids = chapters.map((c) => c.id)

  for (const chapter of chapters) {
    await logsClient.chapters.insert({
      type: "restored",
      old: chapter,
      _new: { ...chapter, deletedAt: null, deleterId: null },
      userId,
    })
  }

  await ChaptersIndexService.sync(db, ids)
  await cacheClient.chapters.invalidateAll()
}

const postDelete = async (chapters: MediaChapter[], userId: string) => {
  const ids = chapters.map((c) => c.id)

  for (const chapter of chapters) {
    await logsClient.chapters.insert({
      type: "deleted",
      old: chapter,
      userId,
    })
  }

  await meilisearchClient.chapters.deleteDocuments(ids)
  await cacheClient.chapters.invalidateAll()
}

export const BaseChaptersService = {
  getDistinctCount,
  postUpload,
  postUpdate,
  postRestore,
  postDelete,
}
