import { AccessControl } from "accesscontrol";

import type { Actions, Resources } from "@taiyo/db/types";

import { InsuficientPermissionsError, InternalServerError } from "../errors";
import { authMiddleware } from "../trpc";

type Grant = {
  resource: Resources;
  action: `${Actions}:any`;
  role: string;
};

export const withPermissions = () =>
  authMiddleware.unstable_pipe(async ({ ctx, meta, next }) => {
    if (!meta?.resource || !meta.action) {
      throw new InternalServerError("Please provide a resource and an action.");
    }

    const { resource, action } = meta;
    const user = ctx.session?.user;
    const role = user?.role;
    const grants: Grant[] = [];

    for (const permission of role.permissions) {
      const { resource: permissionResource, action: permissionAction } =
        permission;

      grants.push({
        resource: permissionResource,
        action: `${permissionAction}:any`,
        role: role.name,
      });
    }

    const ac = new AccessControl(grants);
    const requiredPermission = ac.permission({
      role: role.name,
      resource,
      action,
      possession: "any",
    });

    if (!requiredPermission.granted) {
      throw new InsuficientPermissionsError("You don't have permission.");
    }

    return next({ ctx });
  });
