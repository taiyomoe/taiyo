import type { GroupOwnershipRequest, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"
import { withRequestSpec } from "../utils/openapi-helper"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the ownership request." }),
})

export const checkOwnershipRequest = () =>
  withRequestSpec(
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

      return next()
    }),
    "param",
    paramSchema,
  )
