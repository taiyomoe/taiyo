import type { PrismaClient } from "@prisma/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"

/**
 * Gets the titles and main cover of a media.
 * This is used to populate the Meilisearch titles index.
 */
export const getMediaIndexItem = async (
  db: PrismaClient,
  mediaId: string,
): Promise<MediasIndexItem> => {
  const result = await db.media.findUnique({
    select: {
      id: true,
      synopsis: true,
      type: true,
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
        select: { id: true },
        where: { isMainCover: true },
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
    type: result.type,
    titles: result.titles,
    mainCoverId: result.covers[0]!.id,
  }
}
