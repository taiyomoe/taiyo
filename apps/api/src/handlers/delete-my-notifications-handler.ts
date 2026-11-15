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
    .meta({
      description: `The IDs of the notifications to delete, at most ${config.notifications.maxBulkIds}. IDs of notifications that are not yours are skipped.`,
    }),
})

export const deleteMyNotificationsHandler = new Hono().delete(
  "/me/notifications",
  describeRoute({
    summary: "Delete my notifications",
    description:
      "Deletes the given notifications and returns how many were deleted. Someone who upvotes or follows you again after you deleted their notification can notify you once more.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Notifications deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  count: z
                    .int()
                    .nonnegative()
                    .meta({ description: "The number of notifications deleted.", example: 4 }),
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
