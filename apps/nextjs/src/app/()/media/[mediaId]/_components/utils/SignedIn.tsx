import { auth } from "@taiyo/auth";
import type {
  Actions,
  Permission,
  Permissions,
  RefinedPermission,
  Resources,
} from "@taiyo/db/types";

type Props = {
  allowIfUserHasAtLeastOnePermission?: boolean;
  requiredPermissions?: Permissions;
  anyPermissions?: Permissions;
  children: React.ReactNode;
};

export const SignedIn = async ({
  allowIfUserHasAtLeastOnePermission,
  requiredPermissions,
  anyPermissions,
  children,
}: Props) => {
  const { user } = await auth();

  const permissionToRefinedPermission = (
    permission: Permission,
  ): RefinedPermission => ({
    resource: permission.split(":")[0] as Resources,
    action: permission.split(":")[1] as Actions,
  });

  if (allowIfUserHasAtLeastOnePermission && user.role.permissions.length === 0)
    return null;

  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      user.role.permissions.includes(permissionToRefinedPermission(permission)),
    )
  )
    return null;

  if (
    anyPermissions &&
    !anyPermissions.some((permission) =>
      user.role.permissions.includes(permissionToRefinedPermission(permission)),
    )
  )
    return null;

  return <>{children}</>;
};
