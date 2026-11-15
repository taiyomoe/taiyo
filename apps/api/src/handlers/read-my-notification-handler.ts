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

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the notification." }) })

export const readMyNotificationHandler = new Hono().post(
  "/me/notifications/:id/read",
  describeRoute({
    summary: "Mark one of my notifications as read",
    description:
      "Marks one of your notifications as read. Marking a read notification again keeps the time it was first read.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      201: {
        description: "Notification marked as read.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the notification." }),
                  readAt: z.iso
                    .datetime()
                    .meta({ description: "When you first read the notification." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "You have no notification with the given ID.",
        422: "The provided ID is not a valid UUID.",
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
