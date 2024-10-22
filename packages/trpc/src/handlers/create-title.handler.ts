import { createTitleSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const createTitleHandler = protectedProcedure
  .meta({ resource: "mediaTitles", action: "create" })
  .input(createTitleSchema)
  .mutation(async ({ ctx, input }) => {
    const titles = await ctx.db.mediaTitle.findMany({
      where: { mediaId: input.mediaId },
    })
    const mainTitle = titles.find((t) => t.isMainTitle)!

    if (
      titles.some(
        (t) =>
          t.title.toLowerCase() === input.title.toLowerCase() &&
          t.language === input.language,
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A title with the same language already exists.",
      })
    }

    if (
      titles.some(
        (t) => t.language === input.language && t.priority === input.priority,
      )
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A title with the same language and priority already exists.",
      })
    }

    const result = await ctx.db.$transaction(async (tx) => {
      const result = await ctx.db.mediaTitle.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      })
      const oldMainTitle = input.isMainTitle
        ? await tx.mediaTitle.update({
            data: { isMainTitle: false },
            where: { id: mainTitle.id },
          })
        : null

      return { new: result, old: oldMainTitle }
    })

    await ctx.services.titles.postCreate(ctx.db, "created", [result.new])

    return result.new
  })
