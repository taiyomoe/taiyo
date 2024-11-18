import { randomUUID } from "crypto"
import type { Media } from "@taiyomoe/db"
import { importMediaSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const importMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(importMediaSchema)
  .mutation(async ({ ctx, input }) => {
    const manga = await ctx.services.md.getMedia(input.mdId)
    await ctx.services.md.ensureValid(input.mdId)

    ctx.logger.info(
      `${ctx.session.user.id} started importing MangaDex media ${input.mdId}`,
    )

    const job = await ctx.messaging.medias.import({
      mdId: input.mdId,
      creatorId: ctx.session.user.id,
    })
    const media: Media = await job.waitUntilFinished(ctx.messaging.queue)
    const sessionId = randomUUID()

    if (input.importCovers) {
      const covers = await manga.getCovers()

      for (const cover of covers) {
        await ctx.messaging.covers.import({
          mdId: cover.id,
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: ctx.session.user.id,
          taskId: randomUUID(),
          sessionId,
        })

        ctx.logger.debug(
          `Sent cover ${cover.id} to BullMQ when importing MangaDex media ${input.mdId}`,
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
