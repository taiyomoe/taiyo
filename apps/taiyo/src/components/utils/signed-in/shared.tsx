import type { SessionContextValue } from "@taiyomoe/auth/client"
import type { Roles } from "@taiyomoe/db"
import type { Permission } from "@taiyomoe/types"

export type SignedInProps = {
  requiredRole?: Roles
  requiredPermissions?: Permission[]
  children: React.ReactNode
}

export const computeAccess = (
  { requiredRole, requiredPermissions, children }: SignedInProps,
  session: SessionContextValue["data"],
) => {
  // Not signed in
  if (!session) return null

  // No required role
  if (requiredRole && session.user.role.name !== requiredRole) return null

  // No required permissions
  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      session.user.role.permissions.includes(permission),
    )
  )
    return null

  return <>{children}</>
}
