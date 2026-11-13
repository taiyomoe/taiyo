import { notificationAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
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
    .meta({ description: "The notifications to delete. Ids that aren't yours are skipped." }),
})

export const deleteMyNotificationsHandler = new Hono().delete(
  "/me/notifications",
  describeRoute({
    summary: "Delete notifications",
    description:
      "Deletes several of your notifications and returns how many went. Someone who upvoted or followed you again after you deleted their notification can notify you once more.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "The notifications are deleted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ count: z.int().nonnegative() }))),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The body failed validation." }),
    },
  }),
  audited(notificationAudit.DELETE),
  withAuth(),
  validateJson(bodySchema),
  async (c) => {
    const { db, user, notificationEvents } = c.var
    const { ids } = c.var.json
    const result = await db
      .deleteFrom("notifications")
      .where("userId", "=", user.id)
      .where("id", "in", ids)
      .executeTakeFirst()
    const count = Number(result.numDeletedRows)

    c.var.audit.set({ target: { count } })

    if (count > 0) {
      await notificationEvents.publish([user.id])
    }

    return c.ok({ count })
  },
)
