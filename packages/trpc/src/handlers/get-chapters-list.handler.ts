import {} from "@taiyomoe/meilisearch/utils"
import { getChaptersListSchema } from "@taiyomoe/schemas"
import type { ChaptersListItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { omit, unique } from "radash"
import { protectedProcedure } from "../trpc"
import { convertToFilter } from "../utils/convert-to-filter"
import { convertToSort } from "../utils/convert-to-sort"

export const getChaptersListHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "create" })
  .input(getChaptersListSchema)
  .query(async ({ ctx, input }) => {
    const filter = convertToFilter(omit(input, ["sort", "page", "perPage"]))
    const sorts = convertToSort(input.sort)
    const [totalCount, chaptersCount, rawChapters] = await ctx.db.$transaction([
      ctx.db.mediaChapter.count({ where: { deletedAt: null } }),
      ctx.db.mediaChapter.count({ where: filter }),
      ctx.db.mediaChapter.findMany({
        include: {
          scans: { select: { id: true } },
        },
        where: filter,
        orderBy: sorts,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
    ])
    const uniqueMedias = unique(rawChapters.map((s) => s.mediaId))
    const uniqueScans = unique(
      rawChapters.flatMap((s) => s.scans.map((s) => s.id)),
    )
    const uniqueUsers = unique(
      [
        rawChapters.map((s) => s.uploaderId),
        rawChapters.map((s) => s.deleterId),
      ]
        .flat()
        .filter(Boolean),
    )
    const [medias, scans, users] = await ctx.db.$transaction([
      ctx.db.media.findMany({
        select: { id: true, titles: true },
        where: { id: { in: uniqueMedias } },
      }),
      ctx.db.scan.findMany({
        select: { id: true, name: true },
        where: { id: { in: uniqueScans } },
      }),
      ctx.db.user.findMany({
        select: { id: true, name: true, image: true },
        where: { id: { in: uniqueUsers } },
      }),
    ])
    const chapters = rawChapters.map((c) => ({
      ...c,
      media: {
        id: c.mediaId,
        mainTitle: MediaUtils.getDisplayTitle(
          medias.find((m) => m.id === c.mediaId)!.titles,
          ctx.session.user.settings.preferredTitles,
        ),
      },
      scans: scans.filter((s) => c.scans.some((sc) => sc.id === s.id)),
      uploader: users.find((u) => u.id === c.uploaderId)!,
      deleter: users.find((d) => d.id === c.deleterId) ?? null,
    })) satisfies ChaptersListItem[]

    return {
      stats: { totalCount },
      chapters,
      totalPages: Math.ceil(chaptersCount / input.perPage),
      totalCount: chaptersCount,
    }
  })
