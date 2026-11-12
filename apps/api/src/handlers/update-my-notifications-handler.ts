import { notificationAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  ids: z
    .uuid()
    .array()
    .min(1)
    .max(config.notifications.maxBulkIds)
    .meta({ description: "The notifications to change. Ids that aren't yours are skipped." }),
  read: z.boolean().meta({ description: "True marks them read, false marks them unread." }),
})

export const updateMyNotificationsHandler = new Hono().patch(
  "/me/notifications",
  describeRoute({
    summary: "Mark notifications as read or unread",
    description:
      "Marks several of your notifications as read or unread and returns how many changed. A notification read again keeps its first read time.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "The notifications changed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ count: z.int().nonnegative() }))),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The body failed validation." }),
    },
  }),
  audited(notificationAudit.MARK),
  withAuth(),
  validateJson(bodySchema),
  async (c) => {
    const { db, user, notificationEvents } = c.var
    const { ids, read } = c.var.json
    const result = await db
      .updateTable("notifications")
      .set({ readAt: read ? sql<Date>`CURRENT_TIMESTAMP` : null })
      .where("userId", "=", user.id)
      .where("id", "in", ids)
      .where("readAt", read ? "is" : "is not", null)
      .executeTakeFirst()
    const count = Number(result.numUpdatedRows)

    c.var.audit.set({ target: { count, read } })

    if (count > 0) {
      await notificationEvents.publish([user.id])
    }

    return c.ok({ count })
  },
)
