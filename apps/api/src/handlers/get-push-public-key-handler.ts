import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getPushPublicKeyHandler = new Hono().get(
  "/me/push-subscriptions/public-key",
  describeRoute({
    summary: "Get the push public key",
    description:
      "Returns the VAPID public key a browser needs to subscribe to push notifications, or `null` when the server does not send push notifications.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "The push public key.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  publicKey: z.string().nullable().meta({
                    description:
                      "The VAPID public key, or null when the server does not send push notifications.",
                    example:
                      "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  (c) => c.ok({ publicKey: c.var.vapidPublicKey }),
)
