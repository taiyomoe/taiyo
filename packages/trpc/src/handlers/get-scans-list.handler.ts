import { buildFilter, buildSort } from "@taiyomoe/meilisearch/utils"
import { getScansListSchema } from "@taiyomoe/schemas"
import type { ScansListItem } from "@taiyomoe/types"
import { DateTime } from "luxon"
import { omit, parallel, unique } from "radash"
import { protectedProcedure } from "../trpc"

export const getScansListHandler = protectedProcedure
  .meta({ resource: "scans", action: "create" })
  .input(getScansListSchema)
  .query(async ({ ctx, input }) => {
    const searched = await ctx.meilisearch.scans.search(input.query.q, {
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
    const scans = (await parallel(10, searched.hits, async (h) => {
      const chaptersCount = await ctx.db.mediaChapter.count({
        where: { scans: { some: { id: h.id } } },
      })

      return {
        ...omit(h, [
          "createdAt",
          "updatedAt",
          "deletedAt",
          "creatorId",
          "deleterId",
        ]),
        createdAt: DateTime.fromSeconds(h.createdAt).toJSDate(),
        updatedAt: DateTime.fromSeconds(h.updatedAt).toJSDate(),
        deletedAt: h.deletedAt
          ? DateTime.fromSeconds(h.deletedAt).toJSDate()
          : null,
        creator: users.find((u) => u.id === h.creatorId)!,
        deleter: users.find((d) => d.id === h.deleterId) ?? null,
        chaptersCount,
      }
    })) satisfies ScansListItem[]

    return {
      scans,
      totalPages: searched.totalPages,
      totalCount: searched.totalHits,
    }
  })
