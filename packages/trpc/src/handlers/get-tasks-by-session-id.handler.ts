import { idSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const getTasksBySessionIdHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(idSchema)
  .query(async ({ ctx, input: sessionId }) => {
    const result = await ctx.db.task.findMany({
      where: { sessionId },
    })

    if (!result.length) {
      return null
    }

    return result
  })
