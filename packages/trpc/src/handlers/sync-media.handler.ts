import { randomUUID } from "crypto"
import { syncMediaSchema } from "@taiyomoe/schemas"
import { MdUtils, TitleUtils } from "@taiyomoe/utils"
import { pick } from "radash"
import { protectedProcedure } from "../trpc"

export const syncMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "update" })
  .input(syncMediaSchema)
  .mutation(
    async ({ ctx: { db, logger, rabbit, services, session }, input }) => {
      const media = await services.medias.getById(input.id)
      const mdId = await services.trackers.getMdByMediaId(input.id)
      const mdMedia = await services.md.getMedia(mdId)

      logger.info(
        `${session.user.id} started syncing media ${input.id} with MangaDex media ${mdId}`,
      )

      /**
       * Media's base payload part.
       */
      const payload = services.md.getUpdatePayload(mdMedia, media)
      const sessionId = randomUUID()
      logger.debug(`Parsed update payload from MangaDex media ${mdId}`, payload)

      await db.media.update({
        data: payload,
        where: { id: input.id },
      })

      /**
       * Media's titles part.
       */
      const currentTitles = await db.mediaTitle.findMany({
        where: { mediaId: input.id, deletedAt: null },
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

          await services.titles.postUpdate(
            tx,
            "synced",
            currentTitle,
            result,
            session.user.id,
          )
        }

        /**
         * If no "id" is present, it means MangaDex added a new title.
         * We need to create it in the database.
         */
        for (const title of deltaTitles.filter((t) => !("id" in t))) {
          const result = await tx.mediaTitle.create({
            data: { ...title, mediaId: input.id, creatorId: session.user.id },
          })

          await services.titles.postCreate(tx, "synced", [result])
        }
      })

      /**
       * Media's trackers part.
       */
      const currentTrackers = await db.mediaTracker.findMany({
        where: { mediaId: input.id, deletedAt: null },
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

          await services.trackers.postUpdate(
            "synced",
            existingTracker,
            result,
            session.user.id,
          )

          continue
        }

        const result = await db.mediaTracker.create({
          data: { ...tracker, mediaId: input.id, creatorId: session.user.id },
        })

        await services.trackers.postCreate("synced", [result])
      }

      /**
       * Media's covers part.
       */
      if (input.importCovers) {
        const existingCovers = await db.mediaCover.findMany({
          where: { mediaId: input.id, deletedAt: null },
        })
        const covers = await mdMedia.getCovers()
        const newCovers = covers
          .map((c) => ({
            ...services.md.parseCover(c),
            contentRating: media.contentRating,
            mediaId: media.id,
            uploaderId: session.user.id,
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
          const task = await db.task.create({
            data: {
              type: "IMPORT_COVER",
              status: "PENDING",
              payload: cover,
              sessionId,
            },
          })
          const taskPayload = { ...cover, taskId: task.id }
          await rabbit.medias.importCover(taskPayload)

          logger.debug(
            `Sent cover ${cover.url} to RabbitMQ queue when syncing MangaDex media ${mdId}`,
            cover,
          )
        }
      }

      /**
       * Media's chapters part.
       */
      if (input.importChapters) {
        const existingChapters = await db.mediaChapter.findMany({
          where: { mediaId: input.id, deletedAt: null },
        })
        const chapters = await services.md.getChapters(mdMedia)
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
            ...services.md.parseChapter(c),
            contentRating: media.contentRating,
            mediaId: media.id,
            uploaderId: session.user.id,
          }))
          .filter((c) => !existingChapters.some((ec) => ec.number === c.number))

        logger.debug(
          `Got ${chapters.length} raw chapters and ${newChapters.length} filtered when syncing MangaDex media ${mdId}`,
          chapters,
        )

        for (const chapter of newChapters) {
          const task = await db.task.create({
            data: {
              type: "IMPORT_COVER",
              status: "PENDING",
              payload: chapter,
              sessionId,
            },
          })
          const taskPayload = { ...chapter, taskId: task.id }
          await rabbit.medias.importChapter(taskPayload)

          logger.debug(
            `Sent chapter ${chapter.mdId} to RabbitMQ queue when syncing MangaDex media ${mdId}`,
            chapter,
          )
        }
      }

      return { sessionId }
    },
  )
