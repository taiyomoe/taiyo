import { auth } from "@taiyo/auth";
import type { Permissions } from "@taiyo/db/schema/roles";

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

  if (allowIfUserHasAtLeastOnePermission && user.role.permissions.length === 0)
    return null;

  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      user.role.permissions.includes(permission),
    )
  )
    return null;

  if (
    anyPermissions &&
    !anyPermissions.some((permission) =>
      user.role.permissions.includes(permission),
    )
  )
    return null;

  return <>{children}</>;
};
