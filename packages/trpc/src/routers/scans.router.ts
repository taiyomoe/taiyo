import { getScanIndexItem } from "@taiyomoe/meilisearch/utils"
import { insertScanSchema, searchScanSchema } from "@taiyomoe/schemas"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const scansRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(insertScanSchema)
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

  search: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(searchScanSchema)
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.indexes.scans.search(input)
      return results.hits
    }),
})
