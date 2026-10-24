import type { GroupCreationRequest, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

export const checkGroupCreationRequest = () =>
  createMiddleware<{
    Variables: { groupCreationRequest: Selectable<GroupCreationRequest> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ groupCreationRequest: { id } })

    const groupCreationRequest = await db
      .selectFrom("groupCreationRequests")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()

    if (!groupCreationRequest) {
      return c.fail("GROUP_CREATION_REQUEST_NOT_FOUND")
    }

    c.set("groupCreationRequest", groupCreationRequest)

    return next()
  })
