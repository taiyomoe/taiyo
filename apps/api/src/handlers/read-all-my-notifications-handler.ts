import { notificationAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const readAllMyNotificationsHandler = new Hono().post(
  "/me/notifications/read-all",
  describeRoute({
    summary: "Mark all my notifications as read",
    description:
      "Marks every unread notification of yours as read and returns how many changed.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      201: {
        description: "Your notifications are read.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ count: z.int().nonnegative() }))),
          },
        },
      },
      ...getOpenApiResponses(),
    },
  }),
  audited(notificationAudit.READ_ALL),
  withAuth(),
  async (c) => {
    const { db, user, notificationEvents } = c.var
    const result = await db
      .updateTable("notifications")
      .set({ readAt: sql<Date>`CURRENT_TIMESTAMP` })
      .where("userId", "=", user.id)
      .where("readAt", "is", null)
      .executeTakeFirst()
    const count = Number(result.numUpdatedRows)

    c.var.audit.set({ target: { count } })

    if (count > 0) {
      await notificationEvents.publish([user.id])
    }

    return c.ok({ count })
  },
)
