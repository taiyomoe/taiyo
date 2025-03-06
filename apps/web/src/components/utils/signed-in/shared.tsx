import type { Session } from "@taiyomoe/auth/server"
import type { Roles } from "@taiyomoe/db"
import type { Permission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"

export type SignedInProps = {
  requiredRole?: Roles
  requiredPermissions?: Permission[]
  children: React.ReactNode
}

export const computeAccess = (
  { requiredRole, requiredPermissions, children }: SignedInProps,
  session: Session | null,
) => {
  // Not signed in
  if (!session) return null

  // No required role
  if (requiredRole && session.user.role !== requiredRole) return null

  // No required permissions
  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      PermissionUtils.getRolePermissions(session.user.role).includes(
        permission,
      ),
    )
  )
    return null

  return <>{children}</>
}
