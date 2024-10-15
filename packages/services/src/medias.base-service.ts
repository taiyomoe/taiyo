import { cacheClient } from "@taiyomoe/cache"
import { type Media, type MediaChapter, db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import {
  ChaptersIndexService,
  MediasIndexService,
} from "@taiyomoe/meilisearch/services"
import type {} from "@taiyomoe/types"
import { ObjectUtils } from "@taiyomoe/utils"

const getFull = async (mediaId: string) => {
  const result = await db.media.findFirst({
    select: {
      startDate: true,
      endDate: true,
      synopsis: true,
      status: true,
      genres: true,
      tags: true,
      covers: {
        select: { id: true },
        where: { isMainCover: true, deletedAt: null },
        take: 1,
      },
      banners: {
        select: { id: true },
        take: 1,
        where: { deletedAt: null },
      },
      titles: {
        select: {
          title: true,
          language: true,
          priority: true,
          isAcronym: true,
          isMainTitle: true,
        },
        where: { deletedAt: null },
      },
      trackers: { select: { tracker: true, externalId: true } },
    },
    where: { id: mediaId, deletedAt: null },
  })

  if (!result?.covers.at(0) || !result.titles.at(0)) {
    return null
  }

  return result
}

const postCreate = async (
  type: "created" | "imported" | "synced",
  media: Media,
) => {
  await logsClient.medias.insert({
    type,
    _new: media,
    userId: media.creatorId,
  })

  await MediasIndexService.sync(db, [media.id])
  await cacheClient.medias.latest.invalidate()
}

const postUpdate = async (
  type: "updated" | "synced",
  oldMedia: Media,
  newMedia: Media,
  userId: string,
) => {
  if (ObjectUtils.areEqualTimed(oldMedia, newMedia)) {
    return
  }

  await logsClient.medias.insert({
    type,
    old: oldMedia,
    _new: newMedia,
    userId,
  })

  await MediasIndexService.sync(db, [newMedia.id])
}

const postRestore = async (
  medias: Media[],
  groupedChapters: Record<string, MediaChapter[]>,
  userId: string,
) => {
  const ids = medias.map((m) => m.id)

  for (const media of medias) {
    await logsClient.medias.insert({
      type: "restored",
      old: media,
      _new: { ...media, deletedAt: null, deleterId: null },
      userId,
    })
  }

  for (const chapters of Object.values(groupedChapters)) {
    const chapterIds = chapters.map((c) => c.id)

    await ChaptersIndexService.sync(db, chapterIds)
  }

  await MediasIndexService.sync(db, ids)
  await cacheClient.medias.invalidateAll()
}

const postDelete = async (
  medias: Media[],
  groupedChapters: Record<string, MediaChapter[]>,
) => {
  const ids = medias.map((m) => m.id)

  for (const media of medias) {
    await logsClient.medias.insert({
      type: "deleted",
      old: media,
      userId: media.deleterId!,
    })
  }

  for (const chapters of Object.values(groupedChapters)) {
    const chapterIds = chapters.map((c) => c.id)

    await meilisearchClient.chapters.deleteDocuments(chapterIds)
  }

  await MediasIndexService.sync(db, ids)
  await cacheClient.medias.invalidateAll()
}

export const BaseMediasService = {
  getFull,
  postCreate,
  postUpdate,
  postRestore,
  postDelete,
}
