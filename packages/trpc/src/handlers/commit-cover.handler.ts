import { idSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"
import { HttpError } from "../utils/trpc-error"

export const commitCoverHandler = protectedProcedure
  .meta({ resource: "mediaCovers", action: "create" })
  .input(idSchema)
  .mutation(async ({ ctx, input }) => {
    const payload = await ctx.cache.covers.upload.get(input)

    if (!payload) {
      throw new HttpError("NOT_FOUND", "notFound")
    }

    ctx.logger.info(`${ctx.session.user.id} committed a cover upload`)

    const job = await ctx.messaging.covers.upload(payload)

    await job.waitUntilFinished(ctx.messaging.queues.uploads)
  })
