import { randomUUID } from "crypto"
import { getSignedUrl } from "@taiyomoe/s3"
import { createMediaSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"
import { HttpError } from "../utils/trpc-error"

export const createMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(createMediaSchema)
  .mutation(async ({ ctx, input: { mainCover, ...input } }) => {
    /**
     * Check if media already exists
     */
    const existingMedia = await ctx.db.media.findFirst({
      select: { id: true },
      where: {
        titles: {
          some: { title: { equals: input.mainTitle, mode: "insensitive" } },
        },
      },
    })

    if (existingMedia) {
      throw new HttpError("CONFLICT", "medias.alreadyExists")
    }

    /**
     * Check if a tracker already exists
     */
    const requestedTrackers = [
      input.mdId,
      input.alId?.toString(),
      input.malId?.toString(),
    ].filter(Boolean)
    const existingTracker = await ctx.db.mediaTracker.findMany({
      select: { tracker: true },
      where: { externalId: { in: requestedTrackers } },
    })

    if (existingTracker.length) {
      throw new HttpError("CONFLICT", "medias.alreadyExists")
    }

    ctx.logger.info(
      `${ctx.session.user.id} requested presigned urls for media creation`,
    )

    /**
     * Generate presigned urls
     */
    const mediaId = randomUUID()
    const mainCoverId = randomUUID()
    const mainCoverKey = `${mediaId}/${mainCoverId}.${mainCover.extension}`
    const presignedUrl = await getSignedUrl(
      mainCoverKey,
      mainCover.mimeType,
      mainCover.size,
    )

    /**
     * Save the payload to chache so it can be used
     * later when the media is committed
     */
    await ctx.cache.medias.create.set({
      ...input,
      id: mediaId,
      mainCover: mainCoverKey,
      creatorId: ctx.session.user.id,
    })

    return { id: mediaId, url: presignedUrl }
  })
