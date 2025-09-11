import { ContentRatingSchema } from "@taiyomoe/schemas/db"
import { z } from "zod"
import { protectedProcedure } from "../trpc"

export const updateSettingsHandler = protectedProcedure
  .input(z.object({ contentRating: ContentRatingSchema.array() }).partial())
  .mutation(async ({ ctx, input }) => {
    await ctx.db.user.update({
      data: { settings: input },
      where: { id: ctx.session.user.id },
    })
  })
