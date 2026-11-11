import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { selectVisibleNotifications } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const countMyUnreadNotificationsHandler = new Hono().get(
  "/me/notifications/unread-count",
  describeRoute({
    summary: "Count my unread notifications",
    description:
      "Returns how many of your notifications you haven't read yet.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Your unread count.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ count: z.int().nonnegative() }))),
          },
        },
      },
      ...getOpenApiResponses(),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var
    const row = await selectVisibleNotifications(db, user.id)
      .where("n.readAt", "is", null)
      .select(db.fn.countAll().as("count"))
      .executeTakeFirstOrThrow()

    return c.ok({ count: Number(row.count) })
  },
)
