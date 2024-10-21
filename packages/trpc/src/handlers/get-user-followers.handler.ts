import { getFollowsSchema } from "@taiyomoe/schemas"
import type { UserFollower } from "@taiyomoe/types"
import { publicProcedure } from "../trpc"

export const getUserFollowersHandler = publicProcedure
  .input(getFollowsSchema)
  .query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      select: {
        _count: {
          select: {
            followers: { where: { settings: { showFollowing: true } } },
          },
        },
        followers: {
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
          where: {
            settings: {
              showFollowing: true,
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

    return {
      users: user.followers as UserFollower[],
      totalPages: Math.ceil(user._count.followers / input.perPage),
    }
  })
