import {
  GROUP_MEMBERSHIP_ROLES,
  GROUP_PERMISSIONS,
  type GroupMembershipRole,
  type GroupPermission,
  ROLES,
  type Role,
} from "@taiyomoe/db/constants"
import { createCheck, type DataAtPath, type RulesPaths } from "permix"
import type { Actor, PermissionsDefinition } from "./definition"
import { buildRules, toRole } from "./rules"

export type Permissions = ReturnType<typeof createCheck<PermissionsDefinition>>

export type PermissionPath = RulesPaths<PermissionsDefinition>

export type StaticPermissionPath = {
  [P in PermissionPath]: DataAtPath<PermissionsDefinition, P> extends [] ? P : never
}[PermissionPath]

export const createPermissions = (actor: Actor | null) =>
  createCheck<PermissionsDefinition>(buildRules(actor))

export const allows = (actor: Actor | null, path: StaticPermissionPath) => {
  const rules: Partial<Record<string, Partial<Record<string, unknown>>>> = buildRules(actor)
  const [entity = "", action = ""] = path.split(".")

  return rules[entity]?.[action] === true
}

export { GROUP_MEMBERSHIP_ROLES, GROUP_PERMISSIONS, ROLES }

export type { GroupMembershipRole, GroupPermission, Role }

export type * from "./definition"

export { buildRules, toRole }
