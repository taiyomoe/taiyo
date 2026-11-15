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

const TESTS_PER_MINUTE = 5
const bodySchema = z.object({ endpoint: pushEndpointSchema })

export const testPushSubscriptionHandler = new Hono().post(
  "/me/push-subscriptions/test",
  describeRoute({
    summary: "Send a test push to my device",
    description: `Sends a test push notification to one of your subscribed devices, so you can check that pushes reach it. You can send at most ${TESTS_PER_MINUTE} tests per minute.\n\n**Authentication:** signed-in user.`,
    tags: ["Notifications"],
    responses: {
      201: {
        description: "Test push sent.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  endpoint: z
                    .string()
                    .meta({ description: "The push service URL of the device that got the test." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "None of your devices is subscribed with the given endpoint.",
        410: "The push service no longer accepts the subscription of this device, so it was removed. Subscribe again.",
        422: "The request body failed validation.",
        429: "Too many requests, try again later.",
        502: "The push service did not accept the notification.",
        503: "Push notifications are not configured on this server.",
      }),
    },
  }),
  audited(notificationAudit.PUSH_TEST, () => ({})),
  withAuth(),
  rateLimit({ prefix: "test-push", windowMs: 60_000, limit: TESTS_PER_MINUTE }),
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
