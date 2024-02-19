import type { Languages, MediaStatus } from "@prisma/client"
import type { FeaturedMedia, LatestMedia } from "@taiyomoe/types"
import type { MediasIndexItem } from "@taiyomoe/types/meilisearch.types"
import { TRPCError } from "@trpc/server"
import { db } from "~/lib/server/db"
import { MediaUtils } from "~/lib/utils/media.utils"

/**
 * Gets the titles and main cover of a media.
 * This is used to populate the Meilisearch titles index.
 */
const getIndexItem = async (mediaId: string): Promise<MediasIndexItem> => {
  const result = await db.media.findUnique({
    select: {
      id: true,
      synopsis: true,
      titles: {
        select: {
          title: true,
          language: true,
          priority: true,
          isAcronym: true,
          isMainTitle: true,
        },
      },
      covers: {
        select: {
          id: true,
        },
        where: {
          isMainCover: true,
        },
      },
    },
    where: {
      id: mediaId,
    },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Media '${mediaId}' not found`,
    })
  }

  if (!result.covers.length) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Media '${mediaId}' has no main cover`,
    })
  }

  return {
    id: result.id,
    synopsis: result.synopsis,
    titles: result.titles,
    mainCoverId: result.covers[0]!.id,
  }
}

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
const getLatestMedias = async () => {
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

  return latestMedias
}

/**
 * Gets the featured medias.
 * Used to populate the homepage.
 */
const getFeaturedMedias = async (
  preferredTitles: Languages | null | undefined,
) => {
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

  return featuredMedias
}

export const MediaService = {
  getIndexItem,
  getStatus,
  getLatestMedias,
  getFeaturedMedias,
}
