import { getTasksListSchema } from "@taiyomoe/schemas"
import { pick } from "radash"
import { protectedProcedure } from "../trpc"
import { convertToFilter } from "../utils/convert-to-filter"
import { convertToSort } from "../utils/convert-to-sort"

export const getTasksListHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(getTasksListSchema)
  .query(async ({ ctx, input }) => {
    const filter = convertToFilter(
      pick(input, ["createdAt", "updatedAt", "status", "type"]),
    )
    const sort = convertToSort(input.sort)
    const [active, pending, totalCount, tasks, tasksCount] = await Promise.all([
      ctx.db.task.count({
        where: { status: { in: ["DOWNLOADING", "UPLOADING"] } },
      }),
      ctx.db.task.count({ where: { status: "PENDING" } }),
      ctx.db.task.count(),
      ctx.db.task.findMany({
        where: filter,
        orderBy: sort,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
      ctx.db.task.count({ where: filter }),
    ])

    return {
      stats: {
        active,
        pending,
        totalCount,
      },
      tasks,
      totalPages: Math.ceil(tasksCount / input.perPage),
      totalCount: tasksCount,
    }
  })
