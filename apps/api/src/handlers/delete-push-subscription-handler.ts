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
    summary: "Unsubscribe this device from push notifications",
    description:
      "Forgets the push subscription with the given endpoint. Unsubscribing a device that is not subscribed does nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "The device no longer receives pushes.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ endpoint: z.string() }))),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The endpoint failed validation." }),
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
