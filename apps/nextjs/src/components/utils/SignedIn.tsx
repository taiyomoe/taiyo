import { auth } from "@taiyo/auth";
import type { Permission } from "@taiyo/db/types";
import { PermissionUtils } from "@taiyo/utils";

type Props = {
  allowIfUserHasAtLeastOnePermission?: boolean;
  requiredPermissions?: Permission[];
  anyPermissions?: Permission[];
  children: React.ReactNode;
};

export const SignedIn = async ({
  allowIfUserHasAtLeastOnePermission,
  requiredPermissions,
  anyPermissions,
  children,
}: Props) => {
  const { user } = await auth();

  if (allowIfUserHasAtLeastOnePermission && user.role.permissions.length === 0)
    return null;

  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      user.role.permissions.includes(
        PermissionUtils.refinePermission(permission),
      ),
    )
  )
    return null;

  if (
    anyPermissions &&
    !anyPermissions.some((permission) =>
      user.role.permissions.includes(
        PermissionUtils.refinePermission(permission),
      ),
    )
  )
    return null;

  return <>{children}</>;
};
