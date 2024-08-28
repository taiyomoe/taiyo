import { DEFAULT_GROUPED_CHAPTERS_LIMIT } from "@taiyomoe/constants"
import { db } from "@taiyomoe/db"
import { buildFilter } from "@taiyomoe/meilisearch/utils"
import {
  bulkUpdateChaptersScansSchema,
  bulkUpdateChaptersVolumesSchema,
  getChaptersByUserIdSchema,
  getChaptersListSchema,
  getLatestChaptersGroupedByUserSchema,
  getLatestChaptersGroupedSchema,
  getMediaChaptersByMediaIdSchema,
  idSchema,
  updateChapterSchema,
} from "@taiyomoe/schemas"
import { ChaptersService } from "@taiyomoe/services"
import type { LatestReleaseGrouped, MediaChapterLimited } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, unique } from "radash"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const chaptersRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "mediaChapters", action: "update" })
    .input(updateChapterSchema)
    .mutation(async ({ ctx, input: { scanIds, ...input } }) => {
      const mediaChapter = await ctx.db.mediaChapter.findUnique({
        include: { scans: true },
        where: { id: input.id, deletedAt: null },
      })

      if (!mediaChapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media chapter not found",
        })
      }

      const scans = await ctx.db.scan.findMany({
        where: { id: { in: scanIds } },
      })

      if (scans.length !== scanIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Uma ou várias scans não existem.",
        })
      }

      const result = await ctx.db.mediaChapter.update({
        data: {
          ...input,
          title: input.title === "" ? null : input.title,
          scans: { set: scanIds.map((scanId) => ({ id: scanId })) },
        },
        where: { id: input.id },
      })

      return result
    }),

  updateVolumes: protectedProcedure
    .meta({ resource: "mediaChapters", action: "update" })
    .input(bulkUpdateChaptersVolumesSchema)
    .mutation(async ({ ctx, input: { volumes: input } }) => {
      const chapterIds = [...new Set(input.flatMap((c) => c.ids))]
      const chapters = await ctx.db.mediaChapter.findMany({
        where: { id: { in: chapterIds } },
      })

      if (chapters.length !== chapterIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Um ou vários capítulos não existem.",
        })
      }

      for (const chptrs of input) {
        await ctx.db.mediaChapter.updateMany({
          data: { volume: chptrs.number },
          where: { id: { in: chptrs.ids } },
        })
      }
    }),

  updateScans: protectedProcedure
    .meta({ resource: "mediaChapters", action: "update" })
    .input(bulkUpdateChaptersScansSchema)
    .mutation(async ({ ctx, input: { scans: input } }) => {
      const chapterIds = [...new Set(input.flatMap((c) => c.ids))]
      const chapters = await ctx.db.mediaChapter.findMany({
        where: { id: { in: chapterIds } },
      })

      if (chapters.length !== chapterIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Um ou vários capítulos não existem.",
        })
      }

      const scanIds = [...new Set(input.flatMap((c) => c.scanIds))]
      const scans = await ctx.db.scan.findMany({
        where: { id: { in: scanIds } },
      })

      if (scans.length !== scanIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Uma ou várias scans não existem.",
        })
      }

      if (
        (input.some((c) => c.scanIds.length === 0) &&
          input.some((c) => c.ids.length === 0)) ||
        input.some((c) => c.ids.length === 0)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você tem que selecionar pelo menos 1 capítulo.",
        })
      }

      const mutations = []
      for (const chapterId of chapterIds) {
        mutations.push(
          ctx.db.mediaChapter.update({
            data: { scans: { set: [] } },
            where: { id: chapterId },
          }),
        )
      }

      for (const chapters of input) {
        for (const chapterId of chapters.ids) {
          mutations.push(
            ctx.db.mediaChapter.update({
              data: {
                scans: {
                  connect: chapters.scanIds.map((scanId) => ({ id: scanId })),
                },
              },
              where: { id: chapterId },
            }),
          )
        }
      }

      await ctx.db.$transaction(mutations)
    }),

  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input: chapterId }) => {
      const result = await ctx.db.mediaChapter.findFirst({
        select: {
          title: true,
          number: true,
          volume: true,
          pages: true,
          mediaId: true,
          uploader: { select: { id: true, name: true } },
          media: {
            select: {
              type: true,
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
              chapters: {
                select: {
                  id: true,
                  number: true,
                  title: true,
                },
                where: { deletedAt: null },
              },
            },
          },
          scans: { select: { id: true, name: true } },
          comments: true,
        },
        where: { id: chapterId, deletedAt: null },
      })

      if (!result?.uploader.name || !result.media.titles.at(0)) {
        return null
      }

      const sortedMediaChapters = result.media.chapters.sort(
        (a, b) => a.number - b.number,
      )
      const currentMediaChapterIndex = sortedMediaChapters.findIndex(
        (c) => c.id === chapterId,
      )
      const mediaTitle = MediaUtils.getDisplayTitle(
        result.media.titles,
        ctx.session?.user.preferredTitles,
      )

      const mediaChapterLimited: MediaChapterLimited = {
        id: chapterId,
        title: result.title,
        number: result.number,
        volume: result.volume,
        pages: result.pages,
        previousChapter:
          sortedMediaChapters.at(currentMediaChapterIndex - 1) ?? null,
        nextChapter:
          sortedMediaChapters.at(currentMediaChapterIndex + 1) ?? null,
        // ----- RELATIONS
        uploader: {
          id: result.uploader.id,
          name: result.uploader.name,
        },
        media: {
          id: result.mediaId,
          type: result.media.type,
          title: mediaTitle,
          chapters: sortedMediaChapters,
        },
        scans: result.scans.map((s) => ({
          id: s.id,
          name: s.name,
        })),
        comments: result.comments,
      }

      return mediaChapterLimited
    }),

  getByMediaId: publicProcedure
    .input(getMediaChaptersByMediaIdSchema)
    .query(async ({ ctx, input: { mediaId, page, perPage } }) => {
      const result = await ctx.db.mediaChapter.findMany({
        select: {
          id: true,
          createdAt: true,
          title: true,
          number: true,
          volume: true,
          uploader: { select: { id: true, name: true } },
          scans: { select: { id: true, name: true } },
        },
        where: { mediaId, deletedAt: null },
        orderBy: { number: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      })
      const chaptersCount = await ctx.db.mediaChapter.count({
        where: { mediaId, deletedAt: null },
      })
      const { progression } = ctx.session
        ? (await ctx.db.userHistory.findFirst({
            select: { progression: true },
            where: { userId: ctx.session?.user.id, mediaId },
          })) ?? { progression: [] }
        : { progression: [] }

      const mediaLimitedChapterPagination = {
        chapters: result.map((c) => ({
          id: c.id,
          createdAt: c.createdAt,
          title: c.title,
          number: c.number,
          volume: c.volume,
          // ----- USER PROGRESSION
          completed:
            progression.find((p) => p.chapterId === c.id)?.completed ?? null,
          // ----- RELATIONS
          uploader: {
            id: c.uploader.id,
            name: c.uploader.name,
          },
          scans: c.scans,
        })),
        // ----- OTHERS
        totalPages: Math.ceil(chaptersCount / perPage) || 1,
      }

      return mediaLimitedChapterPagination
    }),

  getByUserId: publicProcedure
    .input(getChaptersByUserIdSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        select: { id: true, name: true },
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      const history = ctx.session?.user.id
        ? (await ctx.db.userHistory.findFirst({
            where: { mediaId: input.mediaId, userId: ctx.session.user.id },
            select: { progression: true },
          })) ?? { progression: [] }
        : { progression: [] }

      const chapters = await db.mediaChapter.findMany({
        select: {
          id: true,
          createdAt: true,
          number: true,
          volume: true,
          title: true,
          scans: { select: { id: true, name: true } },
        },
        where: { mediaId: input.mediaId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip: DEFAULT_GROUPED_CHAPTERS_LIMIT,
      })

      return chapters.map((c) => ({
        ...c,
        completed: history.progression.some(
          (p) => p.chapterId === c.id && p.completed,
        ),
        uploader: user,
      })) satisfies LatestReleaseGrouped["chapters"]
    }),

  getLatestGrouped: publicProcedure
    .input(getLatestChaptersGroupedSchema)
    .query(({ ctx, input }) =>
      ChaptersService.getLatestGrouped(
        input,
        ctx.session?.user.id,
        ctx.session?.user.preferredTitles,
      ),
    ),

  getLatestGroupedByUser: publicProcedure
    .input(getLatestChaptersGroupedByUserSchema)
    .query(({ ctx, input }) =>
      ChaptersService.getLatestGroupedByUser(
        input,
        ctx.session?.user.id,
        ctx.session?.user.preferredTitles,
      ),
    ),

  getList: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(getChaptersListSchema)
    .query(async ({ ctx, input }) => {
      const searched = await ctx.indexes.chapters.search(null, {
        filter: buildFilter(omit(input, ["includeDeleted", "page", "perPage"])),
        hitsPerPage: input.perPage,
        page: input.page,
      })
      const uniqueMedias = unique(searched.hits.map((h) => h.mediaId))
      const uniqueUploaders = unique(searched.hits.map((h) => h.uploaderId))
      const uniqueDeleters = unique(
        searched.hits.map((h) => h.deleterId).filter(Boolean),
      )
      const uniqueScans = unique(searched.hits.flatMap((h) => h.scanIds))
      const medias = await ctx.db.media.findMany({
        select: { id: true, titles: true },
        where: { id: { in: uniqueMedias } },
      })
      const uploaders = await ctx.db.user.findMany({
        select: { id: true, name: true, image: true },
        where: { id: { in: uniqueUploaders } },
      })
      const deleters = await ctx.db.user.findMany({
        select: { id: true, name: true, image: true },
        where: { id: { in: uniqueDeleters } },
      })
      const scans = await ctx.db.scan.findMany({
        select: { id: true, name: true },
        where: { id: { in: uniqueScans } },
      })

      console.log(
        buildFilter(omit(input, ["includeDeleted", "page", "perPage"])),
      )

      return {
        chapters: searched.hits.map((h) => ({
          ...omit(h, [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "mediaId",
            "uploaderId",
            "deleterId",
            "scanIds",
          ]),
          createdAt: DateTime.fromSeconds(h.createdAt).toJSDate(),
          updatedAt: DateTime.fromSeconds(h.updatedAt).toJSDate(),
          deletedAt: h.deletedAt
            ? DateTime.fromSeconds(h.deletedAt).toJSDate()
            : null,
          media: {
            id: h.mediaId,
            mainTitle: MediaUtils.getDisplayTitle(
              medias.find((m) => m.id === h.mediaId)!.titles,
              ctx.session.user.preferredTitles,
            ),
          },
          uploader: uploaders.find((u) => u.id === h.uploaderId)!,
          deleter: deleters.find((d) => d.id === h.deleterId) ?? null,
          scans: h.scanIds.map((s) => scans.find((sc) => sc.id === s)!),
        })),
        totalPages: searched.totalPages,
      }
    }),

  delete: protectedProcedure
    .meta({ resource: "mediaChapters", action: "delete" })
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const mediaChapter = await ctx.db.mediaChapter.findUnique({
        where: { id: input, deletedAt: null },
      })

      if (!mediaChapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media chapter not found",
        })
      }

      await ctx.db.mediaChapter.update({
        data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
        where: { id: input },
      })

      await ctx.logs.chapters.insert({
        type: "deleted",
        old: mediaChapter,
        userId: ctx.session.user.id,
      })
    }),
})
