import { getScanIndexItem } from "@taiyomoe/meilisearch/utils"
import {
  bulkDeleteScansSchema,
  createScanSchema,
  getScansListSchema,
  updateScanSchema,
} from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { omit, parallel } from "radash"
import { createTRPCRouter, protectedProcedure } from "../trpc"
export const scansRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(createScanSchema)
    .mutation(async ({ ctx, input }) => {
      const createdScan = await ctx.db.scan.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      })

      const indexItem = await ScansIndexService.getItem(ctx.db, createdScan.id)
      await ctx.meilisearch.scans.updateDocuments([indexItem])

      await ctx.logs.scans.insert({
        type: "created",
        _new: createdScan,
        userId: ctx.session.user.id,
      })

      return createdScan
    }),

  update: protectedProcedure
    .meta({ resource: "scans", action: "update" })
    .input(updateScanSchema)
    .mutation(async ({ ctx, input }) => {
      const scan = await ctx.db.scan.findUnique({
        where: { id: input.id },
      })

      if (!scan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scan not found",
        })
      }

      const newScan = await ctx.db.scan.update({
        data: input,
        where: { id: input.id },
      })

      await ctx.logs.scans.insert({
        type: "updated",
        old: scan,
        _new: newScan,
        userId: ctx.session.user.id,
      })

      const indexItem = await ScansIndexService.getItem(ctx.db, newScan.id)
      await ctx.meilisearch.scans.updateDocuments([indexItem])
    }),

  getList: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(getScansListSchema)
    .query(async ({ ctx, input }) => {
      const searched = await ctx.meilisearch.scans.search(input.query, {
        hitsPerPage: input.perPage,
        page: input.page,
      })
      const scans = await parallel(10, searched.hits, async ({ id, name }) => {
        const members = await ctx.db.scanMember.count({
          where: { scans: { some: { id } } },
        })
        const chapters = await ctx.db.mediaChapter.count({
          where: { scans: { some: { id } } },
        })

        return { id, name, members, chapters }
      })

      return { scans, totalPages: searched.totalPages }
    }),

  bulkDelete: protectedProcedure
    .meta({ resource: "scans", action: "delete" })
    .input(bulkDeleteScansSchema)
    .mutation(async ({ ctx, input }) => {
      const scans = await ctx.db.scan.findMany({
        include: { chapters: { select: { id: true } } },
        where: { id: { in: input.ids } },
      })

      if (scans.length !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Uma ou várias scans não existem.",
        })
      }

      for (const scan of scans) {
        await ctx.db.scan.update({
          data: {
            deletedAt: new Date(),
            deleterId: ctx.session.user.id,
            chapters: { set: [] },
            members: { set: [] },
          },
          where: { id: scan.id },
        })

        await ctx.logs.scans.insert({
          type: "deleted",
          old: omit(scan, ["chapters"]),
          userId: ctx.session.user.id,
          affectedChaptersIds: scan.chapters.map((c) => c.id),
        })
      }

      await ctx.meilisearch.scans.deleteDocuments(input.ids)
    }),
})
