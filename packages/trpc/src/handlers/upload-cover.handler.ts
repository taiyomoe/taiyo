import { randomUUID } from "crypto"
import { getSignedUrl } from "@taiyomoe/s3"
import { uploadCoverSchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const uploadCoverHandler = protectedProcedure
  .meta({ resource: "mediaCovers", action: "create" })
  .input(uploadCoverSchema)
  .mutation(async ({ ctx, input: { file, ...input } }) => {
    /**
     * Check if media and scans exists
     */
    await ctx.services.medias.getById(input.mediaId)

    ctx.logger.info(
      `${ctx.session.user.id} requested presigned url for cover upload`,
    )

    /**
     * Generate presigned urls
     */
    const coverId = randomUUID()
    const coverKey = `${input.mediaId}/${coverId}.${file.extension}`
    const presignedUrl = await getSignedUrl(coverKey, file.mimeType, file.size)

    /**
     * Save payload to cache so it can be used
     * later when the chapter is committed
     */
    await ctx.cache.covers.upload.set({
      ...input,
      id: coverId,
      cover: coverKey,
      uploaderId: ctx.session.user.id,
    })

    return { id: coverId, url: presignedUrl }
  })
