import { idSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"
import { HttpError } from "../utils/trpc-error"

export const commitChapterHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "create" })
  .input(idSchema)
  .mutation(async ({ ctx, input }) => {
    const payload = await ctx.cache.chapters.uploads.get(input)

    if (!payload) {
      throw new HttpError("NOT_FOUND", "notFound")
    }

    ctx.logger.info(`${ctx.session.user.id} committed a chapter upload`)

    const job = await ctx.messaging.chapters.upload(payload)

    await job.waitUntilFinished(ctx.messaging.queues.uploads)
  })
