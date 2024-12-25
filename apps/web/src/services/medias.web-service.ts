import { cacheClient } from "@taiyomoe/cache"
import { type Languages, db } from "@taiyomoe/db"
import { BaseMediasService } from "@taiyomoe/services"
import type { FeaturedMedia, LatestMedia } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"

/**
 * Gets the latest medias.
 * Used to populate the home page.
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
 * Used to populate the home page.
 */
const getFeatured = async (preferredTitles?: Languages | null) => {
  const cacheController = cacheClient.medias.featured(preferredTitles ?? "main")
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

  const featuredMedias: FeaturedMedia[] = result
    .filter((m) => m.covers.length)
    .map((m) => ({
      id: m.id,
      synopsis: m.synopsis,
      coverId: m.covers.at(0)!.id,
      bannerId: banners.find((b) => b.mediaId === m.id)!.id,
      mainTitle: MediaUtils.getDisplayTitle(m.titles, preferredTitles),
    }))

  void cacheController.set(featuredMedias)

  return featuredMedias
}

export const MediasService = {
  ...BaseMediasService,
  getLatest,
  getFeatured,
}
