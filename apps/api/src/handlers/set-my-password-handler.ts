import { authAudit } from "@taiyomoe/audit"
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
  newPassword: z
    .string()
    .min(config.auth.password.minLength)
    .max(config.auth.password.maxLength)
    .meta({
      description: `The password to sign in with from now on, from ${config.auth.password.minLength} to ${config.auth.password.maxLength} characters.`,
    }),
})

export const setMyPasswordHandler = new Hono().post(
  "/me/password",
  describeRoute({
    summary: "Set my password",
    description:
      "Sets a password on your account when it only signs in with Discord, Google or a magic link. When your account already has a password, use the auth change-password endpoint instead. It needs a sign-in from the last day.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      201: {
        description: "Password set.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  hasPassword: z
                    .literal(true)
                    .meta({ description: "Whether your account has a password." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are banned, or you last signed in more than a day ago: sign in again first.",
        409: "Your account already has a password.",
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(authAudit.PASSWORD_SET, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  validateJson(bodySchema),
  async (c) => {
    const { auth, db, user } = c.var
    const credential = await db
      .selectFrom("accounts")
      .select("id")
      .where("userId", "=", user.id)
      .where("providerId", "=", "credential")
      .executeTakeFirst()

    if (credential !== undefined) {
      return c.fail("PASSWORD_ALREADY_SET")
    }

    // The session may come from the cache: the database row is authoritative.
    const { createdAt } = await db
      .selectFrom("sessions")
      .select("createdAt")
      .where("id", "=", c.var.session.id)
      .executeTakeFirstOrThrow()

    if (Date.now() - createdAt.getTime() >= config.auth.sessionFreshAgeSeconds * 1000) {
      return c.fail("SESSION_NOT_FRESH")
    }

    await auth.api.setPassword({
      body: { newPassword: c.var.json.newPassword },
      headers: c.req.raw.headers,
    })

    return c.ok({ hasPassword: true })
  },
)
