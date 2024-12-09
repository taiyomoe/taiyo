import { protectedProcedure } from "../trpc"

export const getAllTasksHandler = protectedProcedure
  .meta({
    resource: "mediaChapters",
    action: "create",
  })
  .query(async ({ ctx }) => {
    const active = await ctx.db.task.count({
      where: { status: { in: ["DOWNLOADING", "UPLOADING"] } },
    })
    const pending = await ctx.db.task.count({ where: { status: "PENDING" } })
    const total = await ctx.db.task.count()

    return {
      active,
      pending,
      total,
    }
  })
