import { createPermissions, toRole } from "@taiyomoe/permissions"
import type { Session } from "@/lib/queries/session"

export const getPermissions = (user: Session["user"] | null | undefined) =>
  createPermissions(
    user === null || user === undefined
      ? null
      : { id: user.id, role: toRole(user.role), banned: user.banned === true, memberships: [] },
  )
