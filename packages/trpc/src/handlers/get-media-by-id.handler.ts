import { idSchema } from "@taiyomoe/schemas"
import type { MediaLimited } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { publicProcedure } from "../trpc"

export const getMediaByIdHandler = publicProcedure
  .input(idSchema)
  .query(async ({ ctx, input: mediaId }) => {
    const result = await ctx.services.medias.getFull(mediaId)

    if (!result) {
      return null
    }

    const userLibraryMedia = await ctx.services.libraries.getUserMediaLibrary(
      ctx.session?.user.id,
      mediaId,
    )

    const mediaLimited: MediaLimited = {
      id: mediaId,
      synopsis: result.synopsis,
      status: result.status,
      genres: result.genres,
      tags: result.tags,
      // ----- USER LIBRARY
      userLibrary: userLibraryMedia
        ? {
            status: userLibraryMedia.status,
            updatedAt: userLibraryMedia.updatedAt,
          }
        : null,
      // ----- RELATIONS
      coverId: result.covers.at(0)!.id,
      bannerId: result.banners.at(0)?.id ?? null,
      mainTitle: MediaUtils.getDisplayTitle(
        result.titles,
        ctx.session?.user.settings.preferredTitles,
      ),
      titles: result.titles,
      trackers: result.trackers.filter((t) => t.tracker !== "MANGADEX"),
    }

    return mediaLimited
  })
