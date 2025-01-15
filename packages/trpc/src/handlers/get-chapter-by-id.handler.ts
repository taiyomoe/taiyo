import { idSchema } from "@taiyomoe/schemas"
import type { MediaChapterLimited } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { publicProcedure } from "../trpc"

export const getChapterByIdHandler = publicProcedure
  .input(idSchema)
  .query(async ({ ctx, input: chapterId }) => {
    const result = await ctx.db.mediaChapter.findFirst({
      select: {
        title: true,
        number: true,
        volume: true,
        pages: true,
        mediaId: true,
        uploader: { select: { id: true, name: true } },
        media: {
          select: {
            type: true,
            titles: {
              select: {
                title: true,
                language: true,
                priority: true,
                isAcronym: true,
                isMainTitle: true,
              },
              where: { deletedAt: null },
            },
            chapters: {
              select: {
                id: true,
                number: true,
                title: true,
              },
              where: { deletedAt: null },
            },
          },
        },
        scans: { select: { id: true, name: true } },
      },
      where: { id: chapterId, deletedAt: null },
    })

    if (!result?.uploader.name || !result.media.titles.at(0)) {
      return null
    }

    const sortedMediaChapters = result.media.chapters.sort(
      (a, b) => a.number - b.number,
    )
    const currentMediaChapterIndex = sortedMediaChapters.findIndex(
      (c) => c.id === chapterId,
    )
    const mediaTitle = MediaUtils.getDisplayTitle(
      result.media.titles,
      ctx.session?.user.settings.preferredTitles,
    )

    const mediaChapterLimited: MediaChapterLimited = {
      id: chapterId,
      title: result.title,
      number: result.number,
      volume: result.volume,
      pages: result.pages,
      previousChapter:
        sortedMediaChapters.at(currentMediaChapterIndex - 1) ?? null,
      nextChapter: sortedMediaChapters.at(currentMediaChapterIndex + 1) ?? null,
      // ----- RELATIONS
      uploader: {
        id: result.uploader.id,
        name: result.uploader.name,
      },
      media: {
        id: result.mediaId,
        type: result.media.type,
        title: mediaTitle,
        chapters: sortedMediaChapters,
      },
      scans: result.scans.map((s) => ({
        id: s.id,
        name: s.name,
      })),
    }

    return mediaChapterLimited
  })
