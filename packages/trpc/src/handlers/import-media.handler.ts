import { randomUUID } from "crypto"
import type { Media } from "@taiyomoe/db"
import { rawQueueEvents } from "@taiyomoe/messaging"
import { importMediaSchema } from "@taiyomoe/schemas"
import { MdUtils } from "@taiyomoe/utils"
import { parallel } from "radash"
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

    const payload = {
      mdId: input.mdId,
      creatorId: ctx.session.user.id,
    }
    const task = await ctx.services.tasks.create("IMPORT_MEDIA", payload)
    const job = await ctx.messaging.medias.import({
      ...payload,
      taskId: task.id,
    })
    const media: Media = await job.waitUntilFinished(rawQueueEvents)
    const sessionId = randomUUID()

    if (input.importCovers) {
      const rawCovers = await manga.getCovers()
      const covers = await parallel(10, rawCovers, async (c) => {
        const payload = {
          ...MdUtils.parseCover(c, ctx.logger),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: ctx.session.user.id,
          sessionId,
        }
        const task = await ctx.services.tasks.create(
          "IMPORT_COVER",
          payload,
          sessionId,
        )

        return { ...payload, taskId: task.id }
      })

      await ctx.messaging.covers.import(covers)

      ctx.logger.debug(
        `Sent ${covers.length} covers to BullMQ when importing MangaDex media ${input.mdId}`,
        covers,
      )
    }

    if (input.importChapters) {
      const rawChapters = await ctx.services.md.getChapters(manga)
      const filteredChapters = rawChapters.filter((c) => {
        if (c.isExternal) {
          ctx.logger.debug(
            `Skipped external chapter when importing MangaDex media ${input.mdId}`,
            c,
          )

          return false
        }

        return true
      })
      const chapters = await parallel(10, filteredChapters, async (c) => {
        const payload = {
          ...MdUtils.parseChapter(c, ctx.logger),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: ctx.session.user.id,
          sessionId,
        }
        const task = await ctx.services.tasks.create(
          "IMPORT_CHAPTER",
          payload,
          sessionId,
        )

        return { ...payload, taskId: task.id }
      })

      await ctx.messaging.chapters.import(chapters)

      ctx.logger.debug(
        `Sent ${chapters.length} chapters to BullMQ when importing MangaDex media ${input.mdId}`,
        chapters,
      )
    }

    return { media, sessionId }
  })
