import type { Selectable, Staff } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

/**
 * Resolves the `:id` path parameter to a staff row and exposes it on the
 * context as `c.var.staff`.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `STAFF_NOT_FOUND` when no matching staff exists
 *
 * Pass `{ includeDeleted: true }` for routes that operate on soft-deleted
 * staffs. The default excludes soft-deleted rows.
 */
export const checkStaff = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { staff: Selectable<Staff> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ staff: { id } })

    const base = db.selectFrom("staffs").selectAll().where("id", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const staff = await query.executeTakeFirst()

    if (!staff) {
      return c.fail("STAFF_NOT_FOUND")
    }

    log.set({ staff })

    c.set("staff", staff)

    await next()
  })
