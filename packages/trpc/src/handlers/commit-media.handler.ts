import { idSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"
import { HttpError } from "../utils/trpc-error"

export const commitMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(idSchema)
  .mutation(async ({ ctx, input }) => {
    const payload = await ctx.cache.medias.create.get(input)

    if (!payload) {
      throw new HttpError("NOT_FOUND", "notFound")
    }

    ctx.logger.info(`${ctx.session.user.id} committed a media creation`)

    const job = await ctx.messaging.medias.create(payload)

    await job.waitUntilFinished(ctx.messaging.queues.uploads)
  })
