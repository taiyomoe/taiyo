import type { Media } from "@taiyomoe/db"
import { importMediaSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const importMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(importMediaSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.services.md.getMedia(input.mdId)
    await ctx.services.md.ensureValid(input.mdId)

    ctx.logger.info(
      `${ctx.session.user.id} started importing MangaDex media ${input.mdId}`,
    )

    const job = await ctx.messaging.medias.import({
      mdId: input.mdId,
      creatorId: ctx.session.user.id,
    })
    const media: Media = await job.waitUntilFinished(ctx.messaging.queue)

    if (input.importCovers) {
      const covers = await mdMedia.getCovers()
      logger.debug(
        `Got ${covers.length} covers from MangaDex media ${input.mdId}`,
        covers,
      )

      for (const cover of covers) {
        const payload = {
          ...services.md.parseCover(cover),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.user.id,
        }
        const task = await db.task.create({
          data: {
            type: "IMPORT_COVER",
            status: "PENDING",
            payload,
            sessionId,
          },
        })
        const taskPayload = { ...payload, taskId: task.id }

        await rabbit.medias.importCover(taskPayload)
        logger.debug(
          `Sent cover ${cover.id} to RabbitMQ queue when importing MangaDex media ${input.mdId}`,
          taskPayload,
        )
      }
    }

    if (input.importChapters) {
      const chapters = await services.md.getChapters(mdMedia)
      logger.debug(
        `Got ${chapters.length} chapters from MangaDex media ${input.mdId}`,
        chapters,
      )

      for (const chapter of chapters) {
        if (chapter.isExternal) {
          logger.debug(
            `Skipped external chapter when importing MangaDex media ${input.mdId}`,
            chapter,
          )
          continue
        }

        const payload = {
          ...services.md.parseChapter(chapter),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.user.id,
        }
        const task = await db.task.create({
          data: {
            type: "IMPORT_CHAPTER",
            status: "PENDING",
            payload,
            sessionId,
          },
        })
        const taskPayload = { ...payload, taskId: task.id }

        await rabbit.medias.importChapter(taskPayload)
        logger.debug(
          `Sent chapter ${chapter.id} to RabbitMQ queue when importing MangaDex media ${input.mdId}`,
          taskPayload,
        )
      }
    }

    return { media, sessionId }
  })
