import { updateCoverSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const updateCoverHandler = protectedProcedure
  .meta({ resource: "mediaCovers", action: "update" })
  .input(updateCoverSchema)
  .mutation(async ({ ctx, input }) => {
    if (input.isMainCover === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "You cannot remove the main cover. If you want to remove it, set another cover as the main one.",
      })
    }

    const cover = await ctx.db.mediaCover.findUnique({
      where: { id: input.id },
    })

    if (!cover) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media cover not found",
      })
    }

    const mainCover = await ctx.db.mediaCover.findFirst({
      where: { mediaId: cover.mediaId, isMainCover: true },
    })

    if (!mainCover) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media cover not found",
      })
    }

    const result = await ctx.db.$transaction(async (tx) => {
      const result = await ctx.db.mediaCover.update({
        data: input,
        where: { id: input.id },
      })
      const oldMainCover = input.isMainCover
        ? await tx.mediaCover.update({
            data: { isMainCover: false },
            where: { id: mainCover.id },
          })
        : null

      return { new: result, old: oldMainCover }
    })

    if (input.isMainCover && result.old) {
      await ctx.services.covers.postUpdate(
        mainCover,
        result.old,
        ctx.session.user.id,
      )
    }

    await ctx.services.covers.postUpdate(cover, result.new, ctx.session.user.id)
  })
