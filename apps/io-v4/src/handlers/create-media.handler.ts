import { createMediaSchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import type { CustomContext } from "~/types"
import { HttpError } from "~/utils/http-error"

export const createMediaHandler = new Hono<CustomContext>()

createMediaHandler.post(
  "/",
  withAuth([
    ["medias", "create"],
    ["mediaTitles", "create"],
    ["mediaCovers", "create"],
  ]),
  withValidation("form", createMediaSchema),
  async ({ json, req, var: { logger, session, db, rabbit } }) => {
    const body = req.valid("form")

    /**
     * Check if media already exists.
     */
    const existingMedia = await db.media.findFirst({
      select: { id: true },
      where: {
        titles: {
          some: { title: { equals: body.mainTitle, mode: "insensitive" } },
        },
      },
    })

    if (existingMedia) {
      throw new HttpError(409, "medias.alreadyExists")
    }

    /**
     * Check if a tracker already exists.
     */
    const requestedTrackers = [
      body.mdId,
      body.alId?.toString(),
      body.malId?.toString(),
    ].filter(Boolean)
    const existingTracker = await db.mediaTracker.findMany({
      select: { tracker: true },
      where: { externalId: { in: requestedTrackers } },
    })

    if (existingTracker.length) {
      throw new HttpError(409, "medias.alreadyExists")
    }

    logger.info(`${session.id} started creating a media`)

    /**
     * Create media & upload cover.
     */
    const result = await rabbit.medias.create({
      ...body,
      mainCover: Buffer.from(await body.mainCover.arrayBuffer()),
      creatorId: session.id,
    })

    logger.info(`${session.id} created a media (${result.id})`)

    return json(result)
  },
)
