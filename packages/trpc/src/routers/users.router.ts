import { getFollowsSchema, toggleFollowSchema } from "@taiyomoe/schemas"
import { UsersService } from "@taiyomoe/services"
import type { UserFollower } from "@taiyomoe/types"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const usersRouter = createTRPCRouter({
  getFollowers: publicProcedure
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
    }),

  getFollowing: publicProcedure
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
    }),

  toggleFollow: protectedProcedure
    .meta({
      resource: "usersFollow",
      action: "update",
    })
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
