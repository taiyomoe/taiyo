import { toggleFollowSchema } from "@taiyomoe/schemas"
import { UsersService } from "@taiyomoe/services"
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
