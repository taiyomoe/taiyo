import { Prisma, type Task } from "@prisma/client"
import { getTasksListSchema } from "@taiyomoe/schemas"
import { formatQuery } from "react-querybuilder/formatQuery"
import { parseJSONata } from "react-querybuilder/parseJSONata"
import { protectedProcedure } from "../trpc"

export const getTasksListHandler = protectedProcedure
  .meta({ resource: "medias", action: "create" })
  .input(getTasksListSchema)
  .query(async ({ ctx, input }) => {
    const rawFilter = parseJSONata(input.filter)
    const rawWhereClause = formatQuery(rawFilter, "sql").replace("(1 = 1)", "")
    const whereClause = rawWhereClause
      ? `WHERE ${rawWhereClause}`
      : Prisma.empty
    const offset = (input.page - 1) * input.perPage
    const [active, pending, totalCount, tasks] = await Promise.all([
      await ctx.db.task.count({
        where: { status: { in: ["DOWNLOADING", "UPLOADING"] } },
      }),
      await ctx.db.task.count({ where: { status: "PENDING" } }),
      await ctx.db.task.count(),
      await ctx.db.$queryRaw<
        Task[]
      >`SELECT * FROM "Task" ${whereClause} LIMIT ${input.perPage} OFFSET ${offset}`,
    ])

    return {
      stats: {
        active,
        pending,
        totalCount,
      },
      tasks,
      totalPages: Math.ceil(totalCount / input.perPage),
      totalCount: totalCount,
    }
  })
