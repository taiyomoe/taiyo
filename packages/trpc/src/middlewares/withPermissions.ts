import type { Actions, Grant, Posession, Resources } from "@taiyomoe/types"
import { AccessControl } from "accesscontrol"

import { TRPCError } from "@trpc/server"
import { authMiddleware } from "~/trpc"

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
    const grants: Grant[] = []

    for (const permission of role.permissions) {
      const [permResource, permAction, permPosession = "any"] =
        permission.split(":")

      grants.push({
        resource: permResource as Resources,
        action: `${permAction as Actions}:${permPosession as Posession}`,
        role: role.name,
      })
    }

    const ac = new AccessControl(grants)
    const requiredPermission = ac.permission({
      role: role.name,
      resource,
      action,
      possession: "own",
    })

    if (!requiredPermission.granted) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission.",
      })
    }

    return next({ ctx })
  })
