import { importMediaSchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import type { CustomContext } from "~/types"

export const mediasImportHandler = new Hono<CustomContext>()

mediasImportHandler.get(
  "/",
  withAuth([
    ["medias", "create"],
    ["mediaCovers", "create"],
    ["mediaTitles", "create"],
    ["mediaChapters", "create"],
  ]),
  withValidation("query", importMediaSchema),
  async ({ json, req, var: { logger, md, session, rabbit } }) => {
    const body = req.valid("query")
    const mdMedia = await md.getMedia(body.mdId)
    const mainCover = await mdMedia.mainCover.resolve()
    logger.debug(`Got media ${body.mdId} from MangaDex`, mdMedia, mainCover)

    await md.ensureValid(body.mdId)
    logger.debug(`Media ${body.mdId} is valid`)
    logger.info(`${session.id} started importing MangDex media ${body.mdId}`)

    const payload = md.getCreationPayload(mdMedia, session.id)
    logger.debug(`Parsed payload from MangaDex media ${body.mdId}`, payload)

    const media = await rabbit.medias.import({
      payload,
      mainCoverPayload: md.parseCover(mainCover),
    })
    logger.debug(
      `Received created media from RabbitMQ worker for MangaDex import ${body.mdId}`,
      media,
    )

    if (body.importCovers) {
      const covers = await mdMedia.getCovers()
      logger.debug(
        `Got ${covers.length} covers from MangaDex media ${body.mdId}`,
        covers,
      )

      for (const cover of covers) {
        const parsedCover = {
          ...md.parseCover(cover),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.id,
        }

        await rabbit.medias.importCover(parsedCover)
        logger.debug(
          `Sent cover ${cover.id} to RabbitMQ queue when importing MangaDex media ${body.mdId}`,
          parsedCover,
        )
      }
    }

    return json(media)
  },
)
