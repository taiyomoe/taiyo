import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const getGroupHoverCardContent = publicProcedure
  .input(z.string().uuid())
  .query(async ({ ctx, input }) => {
    const [group, chaptersCount] = await ctx.db.$transaction([
      ctx.db.group.findUnique({
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          banner: true,
          website: true,
          discord: true,
          x: true,
        },
        where: { id: input },
      }),
      ctx.db.chapter.count({ where: { groups: { some: { id: input } } } }),
    ])

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    return { ...group, chaptersCount }
  })
