import { idSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const deleteTitleHandler = protectedProcedure
  .meta({ resource: "mediaTitles", action: "delete" })
  .input(idSchema)
  .mutation(async ({ ctx, input }) => {
    const title = await ctx.db.mediaTitle.findUnique({
      where: { id: input },
    })

    if (!title) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media title not found",
      })
    }

    if (title.isMainTitle) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "You cannot remove the main title. If you want to remove it, set another title as the main one first.",
      })
    }

    const result = await ctx.db.mediaTitle.update({
      data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
      where: { id: input },
    })

    await ctx.services.titles.postDelete(result)
  })
