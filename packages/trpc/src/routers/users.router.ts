import { getFollowersSchema, toggleFollowSchema } from "@taiyomoe/schemas"
import { UsersService } from "@taiyomoe/services"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const usersRouter = createTRPCRouter({
  getFollowers: publicProcedure
    .input(getFollowersSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        select: {
          followers: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  country: true,
                  city: true,
                  about: true,
                  birthDate: true,
                },
              },
              settings: {
                select: {
                  showFollowing: true,
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

      return user.followers
    }),

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

      const isFollowing = await UsersService.isFollowing(
        ctx.session.user.id,
        user.id,
      )

      if (isFollowing) {
        await ctx.db.user.update({
          data: { following: { disconnect: { id: user.id } } },
          where: { id: ctx.session.user.id },
        })

        return
      }

      await ctx.db.user.update({
        data: { following: { connect: { id: user.id } } },
        where: { id: ctx.session.user.id },
      })
    }),
})
