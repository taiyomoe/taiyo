import { getScanIndexItem } from "@taiyomoe/meilisearch/utils"
import {
  bulkDeleteScansSchema,
  createScanSchema,
  getScansListSchema,
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

      const indexItem = await getScanIndexItem(ctx.db, createdScan.id)
      await ctx.indexes.scans.updateDocuments([indexItem])

      return createdScan
    }),

  getList: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(getScansListSchema)
    .query(async ({ ctx, input }) => {
      const searched = await ctx.indexes.scans.search(input.search ?? "", {
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
      }

      await ctx.indexes.scans.deleteDocuments(input.ids)
      await ctx.logs.scans.bulkDelete(
        scans.map((s) => ({
          old: omit(s, ["chapters"]),
          userId: ctx.session.user.id,
          affectedChaptersIds: s.chapters.map((c) => c.id),
        })),
      )
    }),
})
