import { getScansListSchema } from "@taiyomoe/schemas"
import type { ScansListItem } from "@taiyomoe/types"
import { omit, parallel, unique } from "radash"
import { protectedProcedure } from "../trpc"
import { convertToFilter } from "../utils/convert-to-filter"
import { convertToSort } from "../utils/convert-to-sort"

export const getScansListHandler = protectedProcedure
  .meta({ resource: "scans", action: "create" })
  .input(getScansListSchema)
  .query(async ({ ctx, input }) => {
    const filter = convertToFilter(omit(input, ["sort", "page", "perPage"]))
    const sorts = convertToSort(input.sort)
    const [totalCount, scansCount, rawScans] = await Promise.all([
      ctx.db.scan.count({ where: { deletedAt: null } }),
      ctx.db.scan.count({ where: filter }),
      ctx.db.scan.findMany({
        where: filter,
        orderBy: sorts,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
    ])
    const uniqueUsers = unique(
      [rawScans.map((s) => s.creatorId), rawScans.map((s) => s.deleterId)]
        .flat()
        .filter(Boolean),
    )
    const users = await ctx.db.user.findMany({
      select: { id: true, name: true, image: true },
      where: { id: { in: uniqueUsers } },
    })
    const scans = (await parallel(10, rawScans, async (s) => {
      const chaptersCount = await ctx.db.mediaChapter.count({
        where: { scans: { some: { id: s.id } } },
      })

      return {
        ...s,
        creator: users.find((u) => u.id === s.creatorId)!,
        deleter: users.find((d) => d.id === s.deleterId) ?? null,
        chaptersCount,
      }
    })) satisfies ScansListItem[]

    return {
      stats: { totalCount },
      scans,
      totalPages: Math.ceil(scansCount / input.perPage),
      totalCount: scansCount,
    }
  })
