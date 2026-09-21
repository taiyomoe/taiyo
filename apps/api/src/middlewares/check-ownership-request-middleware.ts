import type { GroupOwnershipRequest, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({ id: z.uuid() })

/**
 * Resolves the `:id` path parameter to a groupOwnershipRequests row and exposes
 * it on the context as `c.var.ownershipRequest`.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `OWNERSHIP_REQUEST_NOT_FOUND` when no matching request exists
 */
export const checkOwnershipRequest = () =>
  createMiddleware<{
    Variables: { ownershipRequest: Selectable<GroupOwnershipRequest> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ ownershipRequest: { id } })

    const ownershipRequest = await db
      .selectFrom("groupOwnershipRequests")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()

    if (!ownershipRequest) {
      return c.fail("OWNERSHIP_REQUEST_NOT_FOUND")
    }

    log.set({ ownershipRequest })

    c.set("ownershipRequest", ownershipRequest)

    await next()
  })
