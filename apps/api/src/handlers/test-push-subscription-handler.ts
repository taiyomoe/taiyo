import { notificationAudit } from "@taiyomoe/audit"
import { isExpiredPushStatus } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { pushEndpointSchema } from "../utils/push-subscriptions"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({ endpoint: pushEndpointSchema })

export const testPushSubscriptionHandler = new Hono().post(
  "/me/push-subscriptions/test",
  describeRoute({
    summary: "Send a test push to this device",
    description:
      "Sends a test notification to one of your subscribed devices, so you can check that pushes reach it.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "The push service accepted the notification.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ endpoint: z.string() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "This device is not subscribed.",
        410: "The push service dropped this device's subscription; it was forgotten.",
        422: "The endpoint failed validation.",
        429: "Too many requests — slow down.",
        502: "The push service did not accept the notification.",
        503: "The server does not send pushes.",
      }),
    },
  }),
  audited(notificationAudit.PUSH_TEST, () => ({})),
  withAuth(),
  rateLimit({ prefix: "test-push", windowMs: 60_000, limit: 5 }),
  validateJson(bodySchema),
  async (c) => {
    const { db, user, pushSender } = c.var
    const { endpoint } = c.var.json

    if (pushSender === null) {
      return c.fail("PUSH_NOT_CONFIGURED")
    }

    const subscription = await db
      .selectFrom("pushSubscriptions")
      .select(["id", "endpoint", "p256dh", "auth"])
      .where("userId", "=", user.id)
      .where("endpoint", "=", endpoint)
      .executeTakeFirst()

    if (subscription === undefined) {
      return c.fail("PUSH_SUBSCRIPTION_NOT_FOUND")
    }

    c.var.audit.set({ target: { id: subscription.id } })

    const status = await pushSender(subscription, {
      title: "Notifications are on",
      body: "This device will now get new chapters and replies from Taiyō.",
      url: "/notifications",
      icon: null,
      tag: `test-${subscription.id}`,
    }).catch(() => 0)

    if (isExpiredPushStatus(status)) {
      await db.deleteFrom("pushSubscriptions").where("id", "=", subscription.id).execute()

      return c.fail("PUSH_SUBSCRIPTION_EXPIRED")
    }

    if (status < 200 || status >= 300) {
      return c.fail("PUSH_DELIVERY_FAILED")
    }

    return c.ok({ endpoint })
  },
)
