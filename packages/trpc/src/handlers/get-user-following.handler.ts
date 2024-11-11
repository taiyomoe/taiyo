import { getFollowsSchema } from "@taiyomoe/schemas"
import type { UserFollower } from "@taiyomoe/types"
import { publicProcedure } from "../trpc"

export const getUserFollowingHandler = publicProcedure
  .input(getFollowsSchema)
  .query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      select: {
        _count: { select: { following: true } },
        settings: { select: { showFollowing: true } },
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                about: true,
                country: true,
              },
            },
          },
          take: input.perPage,
          skip: (input.page - 1) * input.perPage,
        },
      },
      where: { id: input.userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (!user.settings?.showFollowing) {
      throw new Error("User doesn't have show following settings enabled")
    }

    return {
      users: user.following as UserFollower[],
      totalPages: Math.ceil(user._count.following / input.perPage),
    }
  })
