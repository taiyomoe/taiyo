import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  listNotifications,
  notificationSchema,
  selectVisibleNotifications,
} from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const listMyNotificationsHandler = new Hono().get(
  "/me/notifications",
  describeRoute({
    summary: "List my notifications",
    description:
      "Lists your notifications, newest first: new chapters of the medias in your library and of the groups you follow, and replies to your comments. Notifications whose chapter or reply is gone are left out.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Your notifications.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(notificationSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      listNotifications(db, user.id, { page, perPage }),
      selectVisibleNotifications(db, user.id)
        .select(db.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
