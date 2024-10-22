import { importMediaSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const importMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(importMediaSchema)
  .mutation(async ({ ctx: { logger, rabbit, services, session }, input }) => {
    const mdMedia = await services.md.getMedia(input.mdId)
    const mainCover = await mdMedia.mainCover.resolve()
    logger.debug(`Got media ${input.mdId} from MangaDex`, mdMedia, mainCover)

    await services.md.ensureValid(input.mdId)
    logger.debug(`Media ${input.mdId} is valid`)
    logger.info(
      `${session.user.id} started importing MangaDex media ${input.mdId}`,
    )

    const payload = services.md.getCreationPayload(mdMedia, session.user.id)
    logger.debug(`Parsed payload from MangaDex media ${input.mdId}`, payload)

    const media = await rabbit.medias.import({
      payload,
      mainCoverPayload: services.md.parseCover(mainCover),
    })
    logger.debug(
      `Received created media from RabbitMQ worker for MangaDex import ${input.mdId}`,
      media,
    )

    if (input.importCovers) {
      const covers = await mdMedia.getCovers()
      logger.debug(
        `Got ${covers.length} covers from MangaDex media ${input.mdId}`,
        covers,
      )

      for (const cover of covers) {
        const parsedCover = {
          ...services.md.parseCover(cover),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.user.id,
        }

        await rabbit.medias.importCover(parsedCover)
        logger.debug(
          `Sent cover ${cover.id} to RabbitMQ queue when importing MangaDex media ${input.mdId}`,
          parsedCover,
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

        const parsedChapter = {
          ...services.md.parseChapter(chapter),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.user.id,
        }

        await rabbit.medias.importChapter(parsedChapter)
        logger.debug(
          `Sent chapter ${chapter.id} to RabbitMQ queue when importing MangaDex media ${input.mdId}`,
          parsedChapter,
        )
      }
    }

    return media
  })
