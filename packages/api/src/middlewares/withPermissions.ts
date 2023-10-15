import { AccessControl } from "accesscontrol";

import type { Actions, Resources } from "@taiyo/utils";

import { InsuficientPermissionsError, InternalServerError } from "../errors";
import { authMiddleware } from "../trpc";

type Grant = {
  role: string;
  resource: Resources;
  action: `${Actions}:${"any" | "own"}`;
};

export const withPermissions = () =>
  authMiddleware.unstable_pipe(async ({ ctx, meta, next }) => {
    if (!meta?.resource || !meta.action) {
      throw new InternalServerError("Please provide a resource and an action.");
    }

    const { resource, action } = meta;
    const { role } = ctx.session.user;
    const grants: Grant[] = [];

    for (const permission of role.permissions) {
      const permissionResource = permission.resource;
      const permissionAction = permission.action;
      const permissionPosession = permission.posession ?? "any";

      grants.push({
        resource: permissionResource,
        action: `${permissionAction}:${permissionPosession}`,
        role: role.name,
      });
    }

    const ac = new AccessControl(grants);
    const requiredPermission = ac.permission({
      role: role.name,
      resource,
      action,
      possession: "own",
    });

    if (!requiredPermission.granted) {
      throw new InsuficientPermissionsError("You don't have permission.");
    }

    return next({ ctx });
  });
