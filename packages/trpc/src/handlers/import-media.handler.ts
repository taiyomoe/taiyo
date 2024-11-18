import { randomUUID } from "crypto"
import type { Media } from "@taiyomoe/db"
import { rawQueueEvents } from "@taiyomoe/messaging"
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
    const media: Media = await job.waitUntilFinished(rawQueueEvents)
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
      const chapters = await ctx.services.md.getChapters(manga)

      for (const chapter of chapters) {
        if (chapter.isExternal) {
          ctx.logger.debug(
            `Skipped external chapter when importing MangaDex media ${input.mdId}`,
            chapter,
          )

          continue
        }

        await ctx.messaging.chapters.import({
          mdId: chapter.id,
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: ctx.session.user.id,
          taskId: randomUUID(),
          sessionId,
        })

        ctx.logger.debug(
          `Sent chapter ${chapter.id} to BullMQ when importing MangaDex media ${input.mdId}`,
        )
      }
    }

    return { media, sessionId }
  })
