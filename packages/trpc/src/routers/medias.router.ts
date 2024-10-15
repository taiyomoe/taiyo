import type { MediaChapter, MediaTracker } from "@taiyomoe/db"
import { buildFilter, buildSort } from "@taiyomoe/meilisearch/utils"
import {
  bulkMutateSchema,
  getMediasListSchema,
  idSchema,
  updateMediaSchema,
} from "@taiyomoe/schemas"
import { MediasService } from "@taiyomoe/services"
import type { MediaLimited, MediasListItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { group, omit, parallel, unique } from "radash"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const mediasRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "medias", action: "update" })
    .input(updateMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.db.media.findUnique({
        include: { trackers: true },
        where: { id: input.id },
      })
      const trackers = ctx.services.trackers.getFormatted(
        input,
        ctx.session.user.id,
      )

      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        })
      }

      const result = await ctx.db.media.update({
        data: omit(input, ["mdId", "alId", "malId"]),
        where: { id: input.id },
      })
      const createdTrackers: MediaTracker[] = []

      for (const tracker of trackers) {
        const oldTracker = media.trackers.find(
          (t) => t.tracker === tracker.tracker,
        )

        if (oldTracker) {
          const result = await ctx.db.mediaTracker.update({
            data: tracker,
            where: { id: oldTracker.id },
          })

          await ctx.services.trackers.postUpdate(
            "updated",
            oldTracker,
            result,
            ctx.session.user.id,
          )

          continue
        }

        const result = await ctx.db.mediaTracker.create({
          data: { ...tracker, mediaId: media.id },
        })

        createdTrackers.push(result)
      }

      await MediasService.postUpdate(
        "updated",
        omit(media, ["trackers"]),
        result,
        ctx.session.user.id,
      )
      await ctx.services.trackers.postCreate("created", createdTrackers)
    }),

  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input: mediaId }) => {
      const result = await MediasService.getFull(mediaId)

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
          where: { mediaId: h.id, deletedAt: null },
        })
        const coversCount = await ctx.db.mediaCover.count({
          where: { mediaId: h.id, deletedAt: null },
        })
        const bannersCount = await ctx.db.mediaBanner.count({
          where: { mediaId: h.id, deletedAt: null },
        })
        const chaptersCount = await ctx.db.mediaChapter.count({
          where: { mediaId: h.id, deletedAt: null },
        })

        return {
          ...omit(h, [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "startDate",
            "endDate",
            "titles",
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
          mainTitle: h.titles.find((t) => t.isMainTitle)?.title ?? "",
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

  bulkMutate: protectedProcedure
    .meta({ resource: "medias", action: "update" })
    .input(bulkMutateSchema)
    .mutation(async ({ ctx, input }) => {
      const medias = await ctx.db.media.findMany({
        where: { id: { in: input.ids } },
      })

      if (medias.length !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Um ou vários capítulos não existem.",
        })
      }

      if (input.type === "restore") {
        if (medias.some((m) => m.deletedAt === null)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Algumas obras não estão deletadas.",
          })
        }
      }

      if (input.type === "delete") {
        if (medias.some((m) => m.deletedAt !== null)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Algumas obras já estão deletadas.",
          })
        }
      }

      const newDeletedAt = input.type === "delete" ? new Date() : null
      const newDeleterId = input.type === "delete" ? ctx.session.user.id : null
      const newMedias = medias.map((m) => ({
        ...m,
        deletedAt: newDeletedAt,
        deleterId: newDeleterId,
      }))
      const rawChapters = await parallel(10, medias, (m) =>
        ctx.db.mediaChapter.findMany({
          where: { mediaId: m.id },
        }),
      )
      const chapters = group(rawChapters.flat(), (c) => c.mediaId) as Record<
        string,
        MediaChapter[]
      >

      await ctx.db.media.updateMany({
        data: { deletedAt: newDeletedAt, deleterId: newDeleterId },
        where: { id: { in: input.ids } },
      })

      if (input.type === "restore") {
        await MediasService.postRestore(
          newMedias,
          chapters,
          ctx.session.user.id,
        )

        return
      }

      await MediasService.postDelete(newMedias, chapters)
    }),
})
