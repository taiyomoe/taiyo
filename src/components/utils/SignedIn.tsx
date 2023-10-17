import { getServerAuthSession } from "~/lib/auth/utils";
import { type Permission } from "~/lib/types";
import { PermissionUtils } from "~/lib/utils/permissions.utils";

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
  const session = await getServerAuthSession();

  if (!session) return null;

  if (
    allowIfUserHasAtLeastOnePermission &&
    session.user.role.permissions.length === 0
  )
    return null;

  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      session.user.role.permissions.includes(
        PermissionUtils.refinePermission(permission),
      ),
    )
  )
    return null;

  if (
    anyPermissions &&
    !anyPermissions.some((permission) =>
      session.user.role.permissions.includes(
        PermissionUtils.refinePermission(permission),
      ),
    )
  )
    return null;

  return <>{children}</>;
};
