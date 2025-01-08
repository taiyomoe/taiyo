import { randomUUID } from "crypto"
import { syncMediaSchema } from "@taiyomoe/schemas"
import { MdUtils, TitleUtils } from "@taiyomoe/utils"
import { parallel, pick } from "radash"
import { protectedProcedure } from "../trpc"

export const syncMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "update" })
  .input(syncMediaSchema)
  .mutation(async ({ ctx, input }) => {
    const media = await ctx.services.medias.getById(input.id)
    const mdId = await ctx.services.trackers.getMdByMediaId(input.id)
    const mdMedia = await ctx.services.md.getMedia(mdId)

    ctx.logger.info(
      `${ctx.session.user.id} started syncing media ${input.id} with MangaDex media ${mdId}`,
    )

    /**
     * Media's base payload part.
     */
    const payload = ctx.services.md.getUpdatePayload(mdMedia, media)
    const sessionId = randomUUID()

    await ctx.db.media.update({
      data: payload,
      where: { id: input.id },
    })

    /**
     * Media's titles part.
     */
    const currentTitles = await ctx.db.mediaTitle.findMany({
      where: { mediaId: input.id, deletedAt: null },
    })
    const newTitles = MdUtils.getTitles(mdMedia)
    const rawDeltaTitles = TitleUtils.computeDelta(currentTitles, newTitles)
    const deltaTitles = TitleUtils.computePriorities(
      currentTitles,
      rawDeltaTitles,
    )

    await ctx.db.$transaction(async (tx) => {
      /**
       * Before creating or updating the titles (which is going to mess with priorities),
       * we first make sure that all the lower priorities are available.
       */
      for (const [i, title] of deltaTitles.entries()) {
        if (!("id" in title)) continue

        const randomNumber = 1000 + Math.floor(Math.random() * 1000)

        await tx.mediaTitle.update({
          data: { priority: randomNumber + i },
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

        await ctx.services.titles.postUpdate(
          tx,
          "synced",
          currentTitle,
          result,
          ctx.session.user.id,
        )
      }

      /**
       * If no "id" is present, it means MangaDex added a new title.
       * We need to create it in the database.
       */
      for (const title of deltaTitles.filter((t) => !("id" in t))) {
        const result = await tx.mediaTitle.create({
          data: { ...title, mediaId: input.id, creatorId: ctx.session.user.id },
        })

        await ctx.services.titles.postCreate(tx, "synced", [result])
      }
    })

    /**
     * Media's trackers part.
     */
    const currentTrackers = await ctx.db.mediaTracker.findMany({
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

        const result = await ctx.db.mediaTracker.update({
          data: { externalId: tracker.externalId },
          where: { id: existingTracker.id },
        })

        await ctx.services.trackers.postUpdate(
          "synced",
          existingTracker,
          result,
          ctx.session.user.id,
        )

        continue
      }

      const result = await ctx.db.mediaTracker.create({
        data: { ...tracker, mediaId: input.id, creatorId: ctx.session.user.id },
      })

      await ctx.services.trackers.postCreate("synced", [result])
    }

    /**
     * Media's covers part.
     */
    if (input.importCovers) {
      const existingCovers = await ctx.db.mediaCover.findMany({
        where: { mediaId: input.id, deletedAt: null },
      })
      const rawCovers = await mdMedia.getCovers()
      const filteredCovers = rawCovers
        .map((c) => ({
          ...MdUtils.parseCover(c, ctx.logger),
          contentRating: media.contentRating,
          mdId: c.id,
          mediaId: input.id,
          uploaderId: ctx.session.user.id,
          sessionId,
        }))
        .filter(
          (c) =>
            !existingCovers.some(
              (ec) => ec.volume === c.volume && ec.language === c.language,
            ),
        )
      const covers = await parallel(10, filteredCovers, async (c) => {
        const task = await ctx.services.tasks.create(
          "IMPORT_COVER",
          c,
          sessionId,
        )

        return { ...c, taskId: task.id }
      })

      await ctx.messaging.covers.import(covers)

      ctx.logger.debug(
        `Sent ${covers.length} covers to BullMQ when syncing MangaDex media ${mdId}`,
        covers,
      )
    }

    /**
     * Media's chapters part.
     */
    if (input.importChapters) {
      const existingChapters = await ctx.db.mediaChapter.findMany({
        where: { mediaId: input.id, deletedAt: null },
      })
      const rawChapters = await ctx.services.md.getChapters(mdMedia)
      const filteredChapters = rawChapters
        .filter((c) => {
          if (c.isExternal) {
            ctx.logger.debug(
              `Skipped external chapter when syncing MangaDex media ${mdId}`,
              c,
            )

            return false
          }

          return true
        })
        .map((c) => ({
          ...MdUtils.parseChapter(c, ctx.logger),
          contentRating: media.contentRating,
          mdId: c.id,
          mediaId: media.id,
          uploaderId: ctx.session.user.id,
          sessionId,
        }))
        .filter((c) => !existingChapters.some((ec) => ec.number === c.number))
      const chapters = await parallel(10, filteredChapters, async (c) => {
        const task = await ctx.services.tasks.create(
          "IMPORT_CHAPTER",
          c,
          sessionId,
        )

        return { ...c, taskId: task.id }
      })

      await ctx.messaging.chapters.import(chapters)

      ctx.logger.debug(
        `Sent ${chapters.length} chapters to BullMQ when syncing MangaDex media ${mdId}`,
        chapters,
      )
    }

    return { sessionId }
  })
