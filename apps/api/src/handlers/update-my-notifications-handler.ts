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
    .meta({
      description: `The IDs of the notifications to change, at most ${config.notifications.maxBulkIds}. IDs of notifications that are not yours are skipped.`,
    }),
  read: z.boolean().meta({
    description: "Whether to mark the notifications as read (`true`) or unread (`false`).",
    example: true,
  }),
})

export const updateMyNotificationsHandler = new Hono().patch(
  "/me/notifications",
  describeRoute({
    summary: "Mark my notifications as read or unread",
    description:
      "Marks several of your notifications as read or unread and returns how many changed. A notification that is already read keeps the time it was first read.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Notifications updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  count: z.int().nonnegative().meta({
                    description: "The number of notifications that changed.",
                    example: 3,
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
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
