import { ROLES, type Role } from "@taiyomoe/db/constants"
import { defaultAc } from "better-auth/plugins/admin/access"

type Grants = Parameters<typeof defaultAc.newRole>[0]

const NOTHING: Grants = { user: [], session: [] }
const GRANTS: Partial<Record<Role, Grants>> = {
  ADMIN: { user: ["impersonate", "set-password"], session: ["list", "revoke"] },
}

export const adminPluginRoles = Object.fromEntries(
  ROLES.map((role) => [role, defaultAc.newRole(GRANTS[role] ?? NOTHING)]),
)
