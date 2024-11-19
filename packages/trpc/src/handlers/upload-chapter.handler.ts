import { randomUUID } from "crypto"
import { getSignedUrl } from "@taiyomoe/s3"
import { uploadChapterSchema } from "@taiyomoe/schemas"
import { omit, parallel } from "radash"
import { protectedProcedure } from "../trpc"

export const uploadChapterHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "create" })
  .input(uploadChapterSchema)
  .mutation(async ({ ctx, input }) => {
    /**
     * Check if media and scans exists
     */
    await ctx.services.medias.getById(input.mediaId)
    await ctx.services.scans.getAllById(input.scanIds)

    ctx.logger.info(
      `${ctx.session.user.id} requested presigned urls for chapter upload`,
    )

    /**
     * Generate presigned urls
     */
    const chapterId = randomUUID()
    const pages = Array.from({ length: input.files.length }, (_, i) => ({
      id: randomUUID(),
      ...input.files[i]!,
    }))
    const presignedUrls = await parallel(
      10,
      pages,
      ({ id, mimeType, extension, size }) =>
        getSignedUrl(`${chapterId}/${id}.${extension}`, mimeType, size),
    )

    /**
     * Save payload to cache so it can be used
     * later when the chapter is committed
     */
    await ctx.cache.chapters.uploads.set({
      ...omit(input, ["files"]),
      id: chapterId,
      pages: pages.flatMap((p) => `${chapterId}/${p.id}.${p.extension}`),
      uploaderId: ctx.session.user.id,
    })

    return { id: chapterId, urls: presignedUrls }
  })
