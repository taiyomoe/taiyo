import { buildFilter, buildSort } from "@taiyomoe/meilisearch/utils"
import { getMediasListSchema } from "@taiyomoe/schemas"
import type { MediasListItem } from "@taiyomoe/types"
import { DateTime } from "luxon"
import { omit, parallel, unique } from "radash"
import { protectedProcedure } from "../trpc"

export const getMediasListHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(getMediasListSchema)
  .query(async ({ ctx, input }) => {
    const searched = await ctx.meilisearch.medias.search(input.query.q, {
      attributesToSearchOn: input.query.attributes,
      filter: buildFilter(input.filter),
      sort: buildSort(input.sort),
      hitsPerPage: input.perPage,
      page: input.page,
    })
    const uniqueUsers = unique(
      [
        searched.hits.map((h) => h.creatorId),
        searched.hits.map((h) => h.deleterId).filter(Boolean),
      ].flat(),
    )
    const users = await ctx.db.user.findMany({
      select: { id: true, name: true, image: true },
      where: { id: { in: uniqueUsers } },
    })
    const medias = (await parallel(10, searched.hits, async (h) => {
      const titlesCount = await ctx.db.mediaTitle.count({
        where: { mediaId: h.id, deletedAt: null },
      })
      const coversCount = await ctx.db.mediaCover.count({
        where: { mediaId: h.id, deletedAt: null },
      })
      const bannersCount = await ctx.db.mediaBanner.count({
        where: { mediaId: h.id, deletedAt: null },
      })
      const chaptersCount = await ctx.db.mediaChapter.count({
        where: { mediaId: h.id, deletedAt: null },
      })

      return {
        ...omit(h, [
          "createdAt",
          "updatedAt",
          "deletedAt",
          "startDate",
          "endDate",
          "titles",
          "creatorId",
          "deleterId",
        ]),
        createdAt: DateTime.fromSeconds(h.createdAt).toJSDate(),
        updatedAt: DateTime.fromSeconds(h.updatedAt).toJSDate(),
        deletedAt: h.deletedAt
          ? DateTime.fromSeconds(h.deletedAt).toJSDate()
          : null,
        startDate: h.startDate
          ? DateTime.fromSeconds(h.startDate).toJSDate()
          : null,
        endDate: h.endDate ? DateTime.fromSeconds(h.endDate).toJSDate() : null,
        creator: users.find((u) => u.id === h.creatorId)!,
        deleter: users.find((d) => d.id === h.deleterId) ?? null,
        mainTitle: h.titles.find((t) => t.isMainTitle)?.title ?? "",
        titlesCount,
        chaptersCount,
        coversCount,
        bannersCount,
      }
    })) satisfies MediasListItem[]

    return {
      medias,
      totalPages: searched.totalPages,
      totalCount: searched.totalHits,
    }
  })
