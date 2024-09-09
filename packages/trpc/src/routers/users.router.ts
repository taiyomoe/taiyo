import { UsersIndexService } from "@taiyomoe/meilisearch/services"
import {
  getFollowsSchema,
  toggleFollowSchema,
  updateUserSettingsSchema,
} from "@taiyomoe/schemas"
import { UsersService } from "@taiyomoe/services"
import type { UserFollower } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { crush, get, omit, parallel } from "radash"
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

        await ctx.logs.users.activity.insert({
          type: "unfollow",
          userId: ctx.session.user.id,
          targetId: user.id,
        })

        return
      }

      await ctx.db.user.update({
        data: { following: { connect: { id: user.id } } },
        where: { id: ctx.session.user.id },
      })

      await ctx.logs.users.activity.insert({
        type: "follow",
        userId: ctx.session.user.id,
        targetId: user.id,
      })

      const ownUser = await ctx.db.user.findUnique({
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
          settings: { select: { showFollowing: true } },
        },
        where: { id: ctx.session.user.id },
      })

      if (!ownUser || !ownUser.settings?.showFollowing) {
        return
      }

      return omit(ownUser, ["settings"]) as UserFollower
    }),

  updateSettings: protectedProcedure
    .meta({ resource: "usersSettings", action: "update" })
    .input(updateUserSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        select: {
          settings: true,
          profile: true,
        },
        where: { id: ctx.session.user.id },
      })

      if (!user || !user.settings || !user.profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      await ctx.db.user.update({
        data: {
          settings: { update: omit(input, ["profile"]) },
          profile: { update: input.profile },
        },
        where: { id: ctx.session.user.id },
      })

      const normalizedUser = { ...user.settings, profile: user.profile }

      await parallel(
        10,
        Object.entries(crush(input)),
        async ([type, value]) => {
          await ctx.logs.users.settings.insert({
            type,
            old: String(get(normalizedUser, type)),
            new: String(value),
            userId: ctx.session.user.id,
          })
        },
      )

      await UsersIndexService.sync(ctx.db, [ctx.session.user.id])
    }),
})
