import { notificationAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { LOCALES } from "@taiyomoe/db"
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
    .object({
      p256dh: keySchema.meta({
        description: "The public key of the subscription, base64url-encoded.",
        example:
          "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
      }),
      auth: keySchema.meta({
        description: "The authentication secret of the subscription, base64url-encoded.",
        example: "tBHItJI5svbpez7KI4CCXg",
      }),
    })
    .meta({ description: "The keys from the browser's `PushSubscription`." }),
  locale: z.enum(LOCALES).default("en").meta({
    description:
      "The language of the interface on the device, which its push notifications are written in.",
    example: "pt-BR",
  }),
})

export const upsertPushSubscriptionHandler = new Hono().put(
  "/me/push-subscriptions",
  describeRoute({
    summary: "Subscribe my device to push notifications",
    description: `Subscribes the device to push notifications with the browser's push subscription. The subscription lasts as long as your current session. Its push notifications are written in the given \`locale\`. Saving an endpoint another account used moves it to you, and saving it again refreshes its keys and its \`locale\`. Only your ${config.notifications.maxPushSubscriptions} most recently saved devices are kept.\n\n**Authentication:** signed-in user.`,
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Device subscribed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  endpoint: z
                    .string()
                    .meta({ description: "The push service URL of the subscribed device." }),
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
  audited(notificationAudit.PUSH_SUBSCRIBE, () => ({})),
  withAuth(),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user, session } = c.var
    const { endpoint, keys, locale } = c.var.json
    const userAgent = c.req.header("user-agent")?.slice(0, 512) ?? null
    const { id } = await db
      .insertInto("pushSubscriptions")
      .values({
        userId: user.id,
        sessionId: session.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        locale,
      })
      .onConflict((oc) =>
        oc.column("endpoint").doUpdateSet({
          userId: user.id,
          sessionId: session.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          locale,
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
