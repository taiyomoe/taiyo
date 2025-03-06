import { PermissionUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"
import { authMiddleware } from "../trpc"

export const withPermissions = () =>
  authMiddleware.unstable_pipe(async ({ ctx, meta, next }) => {
    if (!meta?.resource || !meta.action) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Please provide a resource and an action.",
      })
    }

    const { resource, action } = meta
    const { role } = ctx.session.user
    const rolePermissions = PermissionUtils.getRolePermissions(role)

    if (rolePermissions.includes(`${resource}:${action}`)) {
      return next({ ctx })
    }

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission.",
    })
  })
