import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { updateScanSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const updateScanHandler = protectedProcedure
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

    await ScansIndexService.sync(ctx.db, [newScan.id])
  })
