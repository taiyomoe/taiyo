import { idSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const deleteCoverHandler = protectedProcedure
  .meta({ resource: "mediaCovers", action: "delete" })
  .input(idSchema)
  .mutation(async ({ ctx, input }) => {
    const cover = await ctx.db.mediaCover.findUnique({
      where: { id: input },
    })

    if (!cover) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media cover not found",
      })
    }

    if (cover.isMainCover) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "You cannot delete the main cover. If you want to delete it, set another cover as the main one first.",
      })
    }

    const result = await ctx.db.mediaCover.update({
      data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
      where: { id: input },
    })

    await ctx.services.covers.postDelete([result])
  })
