import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { bulkMutateSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { omit } from "radash"
import { protectedProcedure } from "../trpc"

export const bulkMutateScansHandler = protectedProcedure
  .meta({ resource: "scans", action: "update" })
  .input(bulkMutateSchema)
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

    if (input.type === "restore") {
      if (scans.some((c) => c.deletedAt === null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Algumas scans não estão deletadas.",
        })
      }
    }

    if (input.type === "delete") {
      if (scans.some((c) => c.deletedAt !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Algumas scans já estão deletadas.",
        })
      }
    }

    const newScans = scans.map((s) => ({
      ...s,
      deletedAt: input.type === "delete" ? new Date() : null,
      deleterId: input.type === "delete" ? ctx.session.user.id : null,
    }))

    for (const scan of newScans) {
      await ctx.db.scan.update({
        data: {
          deletedAt: scan.deletedAt,
          deleterId: scan.deleterId,
          chapters: { set: [] },
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

    await ScansIndexService.sync(ctx.db, input.ids)
  })
