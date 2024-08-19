import { toggleFollowSchema } from "@taiyomoe/schemas"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const usersRouter = createTRPCRouter({
  toggleFollow: protectedProcedure
    .meta({ resource: "usersFollow", action: "update" })
    .input(toggleFollowSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.followingId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      const isFollowing = await ctx.db.userFollow.findFirst({
        where: { followerId: ctx.session.user.id, followedId: user.id },
      })

      if (isFollowing) {
        await ctx.db.userFollow.delete({
          where: {
            followerId_followedId: {
              followerId: ctx.session.user.id,
              followedId: user.id,
            },
          },
        })

        return
      }

      await ctx.db.userFollow.create({
        data: {
          followerId: ctx.session.user.id,
          followedId: user.id,
        },
      })
    }),
})
