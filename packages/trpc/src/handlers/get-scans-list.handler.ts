import type { Prisma } from "@taiyomoe/db"
import { getScansListSchema } from "@taiyomoe/schemas"
import { pick } from "radash"
import { protectedProcedure } from "../trpc"
import { convertToFilter } from "../utils/convert-to-filter"

export const getScansListHandler = protectedProcedure
  .meta({ resource: "scans", action: "create" })
  .input(getScansListSchema)
  .query(async ({ ctx, input }) => {
    const filter: Prisma.ScanWhereInput = convertToFilter(
      pick(input, ["createdAt", "updatedAt", "deletedAt"]),
    )
    const [totalCount, scans, scansCount] = await Promise.all([
      ctx.db.scan.count({ where: { deletedAt: null } }),
      ctx.db.scan.findMany({
        where: filter,
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
