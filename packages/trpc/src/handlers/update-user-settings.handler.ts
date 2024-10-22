import { UsersIndexService } from "@taiyomoe/meilisearch/services"
import { updateUserSettingsSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { crush, get, omit, parallel } from "radash"
import { protectedProcedure } from "../trpc"

export const updateUserSettingsHandler = protectedProcedure
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

    await parallel(10, Object.entries(crush(input)), async ([type, value]) => {
      await ctx.logs.users.settings.insert({
        type,
        old: String(get(normalizedUser, type)),
        new: String(value),
        userId: ctx.session.user.id,
      })
    })

    await UsersIndexService.sync(ctx.db, [ctx.session.user.id])
  })
