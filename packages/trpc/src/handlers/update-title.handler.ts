import { updateTitleSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const updateTitleHandler = protectedProcedure
  .meta({ resource: "mediaTitles", action: "update" })
  .input(updateTitleSchema)
  .mutation(async ({ ctx, input }) => {
    if (input.isMainTitle === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "You cannot remove the main title. If you want to remove it, set another title as the main one.",
      })
    }

    const title = await ctx.db.mediaTitle.findUnique({
      where: { id: input.id },
    })

    if (!title) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media title not found",
      })
    }

    const titles = await ctx.db.mediaTitle.findMany({
      where: { mediaId: title.mediaId },
    })
    const mainTitle = titles.find((t) => t.isMainTitle)!

    // If there is already a title with the same language and title
    if (
      titles.some(
        (t) =>
          t.title.toLowerCase() === title.title.toLowerCase() &&
          t.language === title.language &&
          t.id !== input.id,
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A title with the same language already exists.",
      })
    }

    const result = await ctx.db.$transaction(async (tx) => {
      const result = await ctx.db.mediaTitle.update({
        data: input,
        where: { id: input.id },
      })
      const oldMainTitle = input.isMainTitle
        ? await tx.mediaTitle.update({
            data: { isMainTitle: false },
            where: { id: mainTitle.id },
          })
        : null

      return { new: result, old: oldMainTitle }
    })

    if (input.isMainTitle && result.old) {
      await ctx.services.titles.postUpdate(
        ctx.db,
        "updated",
        mainTitle,
        result.old,
        ctx.session.user.id,
      )
    }

    await ctx.services.titles.postUpdate(
      ctx.db,
      "updated",
      title,
      result.new,
      ctx.session.user.id,
    )
  })
