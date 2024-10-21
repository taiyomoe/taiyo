import { syncMediaSchema } from "@taiyomoe/schemas"
import { BaseTitlesService } from "@taiyomoe/services"
import { MdUtils, TitleUtils } from "@taiyomoe/utils"
import { Hono } from "hono"
import { pick } from "radash"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import { TrackersService } from "~/services/trackers.io-service"
import type { CustomContext } from "~/types"

export const mediasSyncHandler = new Hono<CustomContext>()

mediasSyncHandler.get(
  "/",
  withAuth([
    ["medias", "create"],
    ["mediaCovers", "create"],
    ["mediaTitles", "create"],
    ["mediaChapters", "create"],
  ]),
  withValidation("query", syncMediaSchema),
  async ({
    json,
    req,
    var: { logger, db, medias, md, trackers, rabbit, session },
  }) => {
    const body = req.valid("query")
    const media = await medias.getById(body.id)
    const mdId = await trackers.getMdByMediaId(body.id)
    const mdMedia = await md.getMedia(mdId)

    logger.info(
      `${session.id} started syncing media ${body.id} with MangaDex media ${mdId}`,
    )

    /**
     * Media's base payload part.
     */
    const payload = md.getUpdatePayload(mdMedia, media)

    logger.debug(`Parsed update payload from MangaDex media ${mdId}`, payload)

    await db.media.update({
      data: payload,
      where: { id: body.id },
    })

    /**
     * Media's titles part.
     */
    const currentTitles = await db.mediaTitle.findMany({
      where: { mediaId: body.id, deletedAt: null },
    })
    const newTitles = MdUtils.getTitles(mdMedia)
    const rawDeltaTitles = TitleUtils.computeDelta(currentTitles, newTitles)
    const deltaTitles = TitleUtils.computePriorities(
      currentTitles,
      rawDeltaTitles,
    )

    logger.debug(`Got delta titles from MangaDex media ${mdId}`, deltaTitles)

    await db.$transaction(async (tx) => {
      /**
       * Before creating or updating the titles (which is going to mess with priorities),
       * we first make sure that all the lower priorities are available.
       */
      for (const [i, title] of deltaTitles.entries()) {
        if (!("id" in title)) continue

        await tx.mediaTitle.update({
          data: { priority: 1000 + i },
          where: { id: title.id },
        })
      }

      /**
       * If an "id" is present, it means the title already exists in the database.
       * In this case, we just need to update it because the priority might have changed.
       */
      for (const title of deltaTitles.filter((t) => "id" in t)) {
        const currentTitle = currentTitles.find((t) => t.id === title.id)!
        const result = await tx.mediaTitle.update({
          data: pick(title, [
            "title",
            "language",
            "priority",
            "isAcronym",
            "isMainTitle",
          ]),
          where: { id: title.id },
        })

        await BaseTitlesService.postUpdate(
          tx,
          "synced",
          currentTitle,
          result,
          session.id,
        )
      }

      /**
       * If no "id" is present, it means MangaDex added a new title.
       * We need to create it in the database.
       */
      for (const title of deltaTitles.filter((t) => !("id" in t))) {
        const result = await tx.mediaTitle.create({
          data: { ...title, mediaId: body.id, creatorId: session.id },
        })

        await BaseTitlesService.postCreate(tx, "synced", [result])
      }
    })

    /**
     * Media's trackers part.
     */
    const currentTrackers = await db.mediaTracker.findMany({
      where: { mediaId: body.id, deletedAt: null },
    })
    const newTrackers = MdUtils.getTrackers(mdMedia)

    for (const tracker of newTrackers) {
      const existingTracker = currentTrackers.find(
        (t) => t.externalId === tracker.externalId,
      )

      /**
       * If the tracker already exists, we need to make sure the ID is the same.
       * If it isn't, we need to update it. This is because MangaDex might have changed the ID.
       */
      if (existingTracker) {
        if (existingTracker.externalId === tracker.externalId) {
          continue
        }

        const result = await db.mediaTracker.update({
          data: { externalId: tracker.externalId },
          where: { id: existingTracker.id },
        })

        await TrackersService.postUpdate(
          "synced",
          existingTracker,
          result,
          session.id,
        )

        continue
      }

      const result = await db.mediaTracker.create({
        data: { ...tracker, mediaId: body.id, creatorId: session.id },
      })

      await TrackersService.postCreate("synced", [result])
    }

    /**
     * Media's covers part.
     */
    if (body.importCovers) {
      const existingCovers = await db.mediaCover.findMany({
        where: { mediaId: body.id, deletedAt: null },
      })
      const covers = await mdMedia.getCovers()
      const newCovers = covers
        .map((c) => ({
          ...md.parseCover(c),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.id,
        }))
        .filter(
          (c) =>
            !existingCovers.some(
              (ec) => ec.volume === c.volume && ec.language === c.language,
            ),
        )

      logger.debug(
        `Got ${covers.length} covers from MangaDex media ${mdId}`,
        covers,
      )

      for (const cover of newCovers) {
        await rabbit.medias.importCover(cover)

        logger.debug(
          `Sent cover ${cover.url} to RabbitMQ queue when syncing MangaDex media ${mdId}`,
          cover,
        )
      }
    }

    /**
     * Media's chapters part.
     */
    if (body.importChapters) {
      const existingChapters = await db.mediaChapter.findMany({
        where: { mediaId: body.id, deletedAt: null },
      })
      const chapters = await md.getChapters(mdMedia)
      const newChapters = chapters
        .filter((c) => {
          if (c.isExternal) {
            logger.debug(
              `Skipped external chapter when syncing MangaDex media ${mdId}`,
              c,
            )

            return false
          }

          return true
        })
        .map((c) => ({
          ...md.parseChapter(c),
          contentRating: media.contentRating,
          mediaId: media.id,
          uploaderId: session.id,
        }))
        .filter((c) => !existingChapters.some((ec) => ec.number === c.number))

      logger.debug(
        `Got ${chapters.length} raw chapters and ${newChapters.length} filtered when syncing MangaDex media ${mdId}`,
        chapters,
      )

      for (const chapter of newChapters) {
        await rabbit.medias.importChapter(chapter)

        logger.debug(
          `Sent chapter ${chapter.mdId} to RabbitMQ queue when syncing MangaDex media ${mdId}`,
          chapter,
        )
      }
    }

    return json(payload)
  },
)
