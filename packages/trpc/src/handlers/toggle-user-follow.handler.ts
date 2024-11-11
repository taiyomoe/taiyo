import { toggleFollowSchema } from "@taiyomoe/schemas"
import type { UserFollower } from "@taiyomoe/types"
import { omit } from "radash"
import { protectedProcedure } from "../trpc"

export const toggleUserFollowHandler = protectedProcedure
  .meta({ resource: "usersFollow", action: "update" })
  .input(toggleFollowSchema)
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: input.followingId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const isFollowing = await ctx.services.users.isFollowing(
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
  })
