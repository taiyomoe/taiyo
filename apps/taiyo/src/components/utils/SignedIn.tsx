import type { Roles } from "@prisma/client"
import { auth } from "@taiyomoe/auth"
import type { Permission } from "@taiyomoe/types"

type Props = {
  requiredRole?: Roles
  requiredPermissions?: Permission[]
  children: React.ReactNode
}

export const SignedIn = async (props: Props) => {
  const { requiredRole, requiredPermissions, children } = props
  const session = await auth()

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
