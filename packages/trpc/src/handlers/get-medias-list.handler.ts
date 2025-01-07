import { getMediasListSchema } from "@taiyomoe/schemas"
import type { MediasListItem } from "@taiyomoe/types"
import { omit, parallel, unique } from "radash"
import { protectedProcedure } from "../trpc"
import { convertToFilter } from "../utils/convert-to-filter"
import { convertToSort } from "../utils/convert-to-sort"

export const getMediasListHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(getMediasListSchema)
  .query(async ({ ctx, input }) => {
    const filter = convertToFilter(omit(input, ["sort", "page", "perPage"]))
    const sorts = convertToSort(input.sort)
    const [totalCount, mediasCount, rawMedias] = await Promise.all([
      ctx.db.media.count({ where: { deletedAt: null } }),
      ctx.db.media.count({ where: filter }),
      ctx.db.media.findMany({
        include: {
          covers: { where: { deletedAt: null } },
          titles: { where: { deletedAt: null } },
        },
        where: filter,
        orderBy: sorts,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
    ])
    const uniqueUsers = unique(
      [rawMedias.map((s) => s.creatorId), rawMedias.map((s) => s.deleterId)]
        .flat()
        .filter(Boolean),
    )
    const users = await ctx.db.user.findMany({
      select: { id: true, name: true, image: true },
      where: { id: { in: uniqueUsers } },
    })
    const medias = (await parallel(10, rawMedias, async (m) => {
      const titlesCount = await ctx.db.mediaTitle.count({
        where: { mediaId: m.id, deletedAt: null },
      })
      const coversCount = await ctx.db.mediaCover.count({
        where: { mediaId: m.id, deletedAt: null },
      })
      const bannersCount = await ctx.db.mediaBanner.count({
        where: { mediaId: m.id, deletedAt: null },
      })
      const chaptersCount = await ctx.db.mediaChapter.count({
        where: { mediaId: m.id, deletedAt: null },
      })

      return {
        ...m,
        creator: users.find((u) => u.id === m.creatorId)!,
        deleter: users.find((d) => d.id === m.deleterId) ?? null,
        mainTitle: m.titles.find((t) => t.isMainTitle)?.title ?? "",
        mainCoverId: m.covers.at(0)?.id ?? "",
        titlesCount,
        chaptersCount,
        coversCount,
        bannersCount,
      }
    })) satisfies MediasListItem[]

    return {
      stats: { totalCount },
      medias,
      totalPages: Math.ceil(mediasCount / input.perPage),
      totalCount: mediasCount,
    }
  })
