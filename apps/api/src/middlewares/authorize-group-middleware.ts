import type { Group, Selectable } from "@taiyomoe/db"
import type { Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"

export const authorizeGroup = (
  action: "update" | "uploadChapters" | "manageMembers" | "transferOwnership",
) =>
  createMiddleware<{ Variables: { can: Permissions; group: Selectable<Group> } }>(
    async (c, next) => {
      const { can, group } = c.var

      if (!can(`group.${action}`, { id: group.id })) {
        return c.fail("FORBIDDEN")
      }

      return next()
    },
  )
