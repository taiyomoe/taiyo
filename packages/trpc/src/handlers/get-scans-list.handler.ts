import { getScansListSchema } from "@taiyomoe/schemas"
import { omit } from "radash"
import { protectedProcedure } from "../trpc"
import { convertToFilter } from "../utils/convert-to-filter"
import { convertToSort } from "../utils/convert-to-sort"

export const getScansListHandler = protectedProcedure
  .meta({ resource: "scans", action: "create" })
  .input(getScansListSchema)
  .query(async ({ ctx, input }) => {
    const filter = convertToFilter(omit(input, ["sort", "page", "perPage"]))
    const sorts = convertToSort(input.sort)
    const [totalCount, scans, scansCount] = await Promise.all([
      ctx.db.scan.count({ where: { deletedAt: null } }),
      ctx.db.scan.findMany({
        where: filter,
        orderBy: sorts,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
      ctx.db.scan.count({ where: filter }),
    ])

    return {
      stats: {
        totalCount,
      },
      scans,
      totalPages: Math.ceil(scansCount / input.perPage),
      totalCount: scansCount,
    }
  })
