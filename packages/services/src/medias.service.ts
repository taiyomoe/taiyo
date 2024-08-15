import { cacheClient } from "@taiyomoe/cache"
import { type Languages, type MediaStatus, db } from "@taiyomoe/db"
import type { FeaturedMedia, LatestMedia } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"

/**
 * Gets the status of a media.
 * Used to check wether or not a user can complete a media.
 */
const getStatus = async (mediaId: string): Promise<MediaStatus> => {
  const result = await db.media.findUnique({
    select: { status: true },
    where: { id: mediaId },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Media '${mediaId}' not found`,
    })
  }

  return result.status
}

/**
 * Gets the latest medias.
 * Used to populate the homepage.
 */
const getLatest = async () => {
  const cacheController = cacheClient.medias.latest
  const cached = await cacheController.get()

  if (cached) {
    return cached
  }

  const result = await db.media.findMany({
    select: {
      id: true,
      covers: {
        select: { id: true },
        where: { isMainCover: true },
        take: 1,
      },
    },
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 15,
  })

  if (result.some((m) => !m.covers.length)) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Some medias have no main cover",
    })
  }

  const latestMedias: LatestMedia[] = result
    .filter((m) => m.covers.length)
    .map((m) => ({
      id: m.id,
      coverId: m.covers.at(0)!.id,
    }))

  void cacheController.set(latestMedias)

  return latestMedias
}

/**
 * Gets the featured medias.
 * Used to populate the homepage.
 */
const getFeatured = async (preferredTitles: Languages = "en") => {
  const cacheController = cacheClient.medias.featured(preferredTitles)
  const cached = await cacheController.get()

  if (cached) {
    return cached
  }

  const banners = await db.$queryRaw<
    { id: string; mediaId: string }[]
  >`SELECT "id", "mediaId" FROM "MediaBanner" WHERE "deletedAt" IS NULL ORDER BY RANDOM() LIMIT 15;`
  const result = await db.media.findMany({
    select: {
      id: true,
      synopsis: true,
      covers: {
        select: { id: true },
        where: { isMainCover: true },
        take: 1,
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
    },
    where: {
      banners: { some: { id: { in: banners.map((b) => b.id) } } },
      deletedAt: null,
    },
    take: 15,
  })

  if (result.some((m) => !m.covers.length)) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Some medias have no main cover",
    })
  }

  const featuredMedias: FeaturedMedia[] = result.map((m) => ({
    id: m.id,
    synopsis: m.synopsis,
    coverId: m.covers.at(0)!.id,
    bannerId: banners.find((b) => b.mediaId === m.id)!.id,
    mainTitle: MediaUtils.getMainTitle(m.titles, preferredTitles),
  }))

  void cacheController.set(featuredMedias)

  return featuredMedias
}

const getFull = async (mediaId: string) => {
  const result = await db.media.findFirst({
    select: {
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

export const MediasService = {
  getStatus,
  getLatest,
  getFeatured,
  getFull,
}
