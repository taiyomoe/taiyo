import { notificationAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { pushEndpointSchema } from "../utils/push-subscriptions"
import { apiSuccessEnvelope } from "../utils/schemas"

const keySchema = z.string().min(1).max(256)
const bodySchema = z.object({
  endpoint: pushEndpointSchema,
  keys: z
    .object({ p256dh: keySchema, auth: keySchema })
    .meta({ description: "The keys from the browser's `PushSubscription`." }),
})

export const upsertPushSubscriptionHandler = new Hono().put(
  "/me/push-subscriptions",
  describeRoute({
    summary: "Subscribe this device to push notifications",
    description: `Saves the browser's push subscription for the signed-in user. Saving an endpoint another account used moves it to you, and saving it again refreshes its keys. Only your ${config.notifications.maxPushSubscriptions} most recently saved devices are kept.\n\n**Authentication:** signed-in user.`,
    tags: ["Notifications"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "The device is subscribed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ endpoint: z.string() }))),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The subscription failed validation." }),
    },
  }),
  audited(notificationAudit.PUSH_SUBSCRIBE, () => ({})),
  withAuth(),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { endpoint, keys } = c.var.json
    const userAgent = c.req.header("user-agent")?.slice(0, 512) ?? null
    const { id } = await db
      .insertInto("pushSubscriptions")
      .values({ userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent })
      .onConflict((oc) =>
        oc.column("endpoint").doUpdateSet({
          userId: user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
        }),
      )
      .returning("id")
      .executeTakeFirstOrThrow()

    c.var.audit.set({ target: { id } })

    await db
      .deleteFrom("pushSubscriptions")
      .where("userId", "=", user.id)
      .where("id", "not in", (eb) =>
        eb
          .selectFrom("pushSubscriptions")
          .select("id")
          .where("userId", "=", user.id)
          .orderBy("updatedAt", "desc")
          .orderBy("id", "desc")
          .limit(config.notifications.maxPushSubscriptions),
      )
      .execute()

    return c.ok({ endpoint })
  },
)
