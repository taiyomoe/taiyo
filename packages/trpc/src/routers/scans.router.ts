import { getScanIndexItem } from "@taiyomoe/meilisearch/utils"
import { createScanSchema, getScansListSchema } from "@taiyomoe/schemas"
import { parallel } from "radash"
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
})
