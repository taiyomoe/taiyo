import type { Selectable, User } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"
import { withRequestSpec } from "../utils/openapi-helper"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the user." }),
})

export const checkUser = (opts: { includeBanned?: boolean } = {}) =>
  withRequestSpec(
    createMiddleware<{
      Variables: { targetUser: Selectable<User> }
    }>(async (c, next) => {
      const parsed = paramSchema.safeParse({ id: c.req.param("id") })

      if (!parsed.success) {
        return c.fail("VALIDATION_ERROR", parsed.error.issues)
      }

      const { id } = parsed.data
      const { db, log } = c.var

      log.set({ targetUser: { id } })

      const base = db.selectFrom("users").selectAll().where("id", "=", id)
      const targetUser = await (
        opts.includeBanned === true
          ? base
          : base.where((eb) => eb.or([eb("banned", "is", null), eb("banned", "=", false)]))
      ).executeTakeFirst()

      if (!targetUser) {
        return c.fail("USER_NOT_FOUND")
      }

      // The row holds personal data (email, ban reason): the request log, which reaches HyperDX
      // and the audit log, only gets what identifies the target.
      log.set({ targetUser: { id: targetUser.id, role: targetUser.role } })

      c.set("targetUser", targetUser)

      return next()
    }),
    "param",
    paramSchema,
  )
