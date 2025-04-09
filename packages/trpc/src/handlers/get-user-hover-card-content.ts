import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const getUserHoverCardContent = publicProcedure
  .input(z.string().uuid())
  .query(async ({ ctx, input }) => {
    const [user, chaptersCount] = await ctx.db.$transaction([
      ctx.db.user.findUnique({
        select: {
          id: true,
          displayUsername: true,
          username: true,
          role: true,
          image: true,
          profile: {
            select: {
              banner: true,
              birthDate: true,
              gender: true,
              city: true,
              country: true,
              about: true,
              points: true,
            },
          },
        },
        where: { id: input },
      }),
      ctx.db.chapter.count({ where: { uploaderId: input, deletedAt: null } }),
    ])

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    }

    return { ...user, profile: user.profile!, chaptersCount }
  })
