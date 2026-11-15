import { notificationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { pushEndpointSchema } from "../utils/push-subscriptions"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({ endpoint: pushEndpointSchema })

export const deletePushSubscriptionHandler = new Hono().delete(
  "/me/push-subscriptions",
  describeRoute({
    summary: "Delete my push subscription",
    description:
      "Deletes your push subscription with the given endpoint, so the device stops receiving push notifications. Deleting a subscription that does not exist does nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Push subscription deleted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(bodySchema)),
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
  audited(notificationAudit.PUSH_UNSUBSCRIBE, () => ({})),
  withAuth(),
  validateJson(bodySchema),
  async (c) => {
    const { db, user } = c.var
    const { endpoint } = c.var.json
    const deleted = await db
      .deleteFrom("pushSubscriptions")
      .where("userId", "=", user.id)
      .where("endpoint", "=", endpoint)
      .returning("id")
      .executeTakeFirst()

    c.var.audit.set({ target: { id: deleted?.id } })

    return c.ok({ endpoint })
  },
)
