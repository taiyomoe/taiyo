import { MediasIndexService } from "@taiyomoe/meilisearch/services"
import { buildFilter, buildSort } from "@taiyomoe/meilisearch/utils"
import {
  getMediasListSchema,
  idSchema,
  updateMediaSchema,
} from "@taiyomoe/schemas"
import { LibrariesService, MediasService } from "@taiyomoe/services"
import type { MediaLimited, MediasListItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, parallel, unique } from "radash"
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

      await MediasIndexService.sync(ctx.db, [input.id])
    }),

  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input: mediaId }) => {
      const result = await MediasService.getFull(mediaId)

      if (!result) {
        return null
      }

      const userLibraryMedia = await LibrariesService.getUserLibraryMedia(
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
          ctx.session?.user.preferredTitles,
        ),
        titles: result.titles,
        trackers: result.trackers.filter((t) => t.tracker !== "MANGADEX"),
      }

      return mediaLimited
    }),

  getList: protectedProcedure
    .meta({ resource: "medias", action: "create" })
    .input(getMediasListSchema)
    .query(async ({ ctx, input }) => {
      const searched = await ctx.meilisearch.medias.search(input.query.q, {
        attributesToSearchOn: input.query.attributes,
        filter: buildFilter(input.filter),
        sort: buildSort(input.sort),
        hitsPerPage: input.perPage,
        page: input.page,
      })
      const uniqueUsers = unique(
        [
          searched.hits.map((h) => h.creatorId),
          searched.hits.map((h) => h.deleterId).filter(Boolean),
        ].flat(),
      )
      const users = await ctx.db.user.findMany({
        select: { id: true, name: true, image: true },
        where: { id: { in: uniqueUsers } },
      })
      const medias = (await parallel(10, searched.hits, async (h) => {
        const titlesCount = await ctx.db.mediaTitle.count({
          where: { mediaId: h.id },
        })
        const coversCount = await ctx.db.mediaCover.count({
          where: { mediaId: h.id },
        })
        const bannersCount = await ctx.db.mediaBanner.count({
          where: { mediaId: h.id },
        })
        const chaptersCount = await ctx.db.mediaChapter.count({
          where: { mediaId: h.id },
        })

        return {
          ...omit(h, [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "startDate",
            "endDate",
            "titles",
            "mainCoverId",
            "creatorId",
            "deleterId",
          ]),
          createdAt: DateTime.fromSeconds(h.createdAt).toJSDate(),
          updatedAt: DateTime.fromSeconds(h.updatedAt).toJSDate(),
          deletedAt: h.deletedAt
            ? DateTime.fromSeconds(h.deletedAt).toJSDate()
            : null,
          startDate: h.startDate
            ? DateTime.fromSeconds(h.startDate).toJSDate()
            : null,
          endDate: h.endDate
            ? DateTime.fromSeconds(h.endDate).toJSDate()
            : null,
          creator: users.find((u) => u.id === h.creatorId)!,
          deleter: users.find((d) => d.id === h.deleterId) ?? null,
          mainTitle: MediaUtils.getDisplayTitle(
            h.titles,
            ctx.session.user.preferredTitles,
          ),
          titlesCount,
          chaptersCount,
          coversCount,
          bannersCount,
        }
      })) satisfies MediasListItem[]

      return {
        medias,
        totalPages: searched.totalPages,
        totalCount: searched.totalHits,
      }
    }),
})
