import { notificationAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { timestampSql } from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })

export const readMyNotificationHandler = new Hono().post(
  "/me/notifications/:id/read",
  describeRoute({
    summary: "Mark a notification as read",
    description:
      "Marks one of your notifications as read. Marking a read notification again keeps its first read time.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      201: {
        description: "The notification is read.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ id: z.uuid(), readAt: z.iso.datetime() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "You have no notification with the given id.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  audited(notificationAudit.READ),
  withAuth(),
  validateParam(paramSchema),
  async (c) => {
    const { db, user, notificationEvents } = c.var
    const { id } = c.var.param
    const notification = await db
      .updateTable("notifications")
      .set({ readAt: sql<Date>`coalesce("readAt", CURRENT_TIMESTAMP)` })
      .where("id", "=", id)
      .where("userId", "=", user.id)
      .returning(["id", timestampSql("readAt").as("readAt")])
      .executeTakeFirst()

    if (notification === undefined) {
      return c.fail("NOTIFICATION_NOT_FOUND")
    }

    await notificationEvents.publish([user.id])

    return c.ok(notification)
  },
)
