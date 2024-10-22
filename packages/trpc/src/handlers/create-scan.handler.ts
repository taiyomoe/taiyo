import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { createScanSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const createScanHandler = protectedProcedure
  .meta({ resource: "scans", action: "create" })
  .input(createScanSchema)
  .mutation(async ({ ctx, input }) => {
    const createdScan = await ctx.db.scan.create({
      data: {
        ...input,
        creatorId: ctx.session.user.id,
      },
    })

    await ctx.logs.scans.insert({
      type: "created",
      _new: createdScan,
      userId: ctx.session.user.id,
    })

    await ScansIndexService.sync(ctx.db, [createdScan.id])

    return createdScan
  })
