import { getMediaIndexItem } from "@taiyomoe/meilisearch/utils"
import { idSchema, updateMediaSchema } from "@taiyomoe/schemas"
import { LibraryService } from "@taiyomoe/services"
import type { MediaLimited } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const mediasRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "medias", action: "update" })
    .input(updateMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.db.media.findUnique({
        select: { id: true },
        where: { id: input.id },
      })

      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        })
      }

      await ctx.db.media.update({
        where: { id: input.id },
        data: input,
      })

      const indexItem = await getMediaIndexItem(ctx.db, input.id)
      await ctx.indexes.medias.updateDocuments([indexItem])
    }),

  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input: mediaId }) => {
      const result = await ctx.db.media.findFirst({
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

      const userLibraryMedia = await LibraryService.getUserLibraryMedia(
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
        mainTitle: MediaUtils.getMainTitle(
          result.titles,
          ctx.session?.user.preferredTitles,
        ),
        titles: result.titles,
        trackers: result.trackers.filter((t) => t.tracker !== "MANGADEX"),
      }

      return mediaLimited
    }),
})
