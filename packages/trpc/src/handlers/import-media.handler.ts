import { randomUUID } from "crypto"
import type { Media } from "@taiyomoe/db"
import { rawQueueEvents } from "@taiyomoe/messaging"
import { importMediaSchema } from "@taiyomoe/schemas"
import { MdUtils } from "@taiyomoe/utils"
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
      const rawCovers = await manga.getCovers()
      const covers = rawCovers.map((c) => ({
        ...MdUtils.parseCover(c, ctx.logger),
        contentRating: media.contentRating,
        mediaId: media.id,
        uploaderId: ctx.session.user.id,
        taskId: randomUUID(),
        sessionId,
      }))

      await ctx.messaging.covers.import(covers)

      ctx.logger.debug(
        `Sent ${covers.length} covers to BullMQ when importing MangaDex media ${input.mdId}`,
        covers,
      )
    }

    if (input.importChapters) {
      const rawChapters = await ctx.services.md.getChapters(manga)
      const chapters = rawChapters
        .filter((c) => {
          if (c.isExternal) {
            ctx.logger.debug(
              `Skipped external chapter when importing MangaDex media ${input.mdId}`,
              c,
            )

            return false
          }

          return true
        })
        .map((c) => ({
          ...MdUtils.parseChapter(c, ctx.logger),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: ctx.session.user.id,
          taskId: randomUUID(),
          sessionId,
        }))

      await ctx.messaging.chapters.import(chapters)

      ctx.logger.debug(
        `Sent ${chapters.length} chapters to BullMQ when importing MangaDex media ${input.mdId}`,
        chapters,
      )
    }

    return { media, sessionId }
  })
