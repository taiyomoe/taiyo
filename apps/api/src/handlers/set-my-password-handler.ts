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
    .meta({ description: "The password to sign in with from now on." }),
})

export const setMyPasswordHandler = new Hono().post(
  "/me/password",
  describeRoute({
    summary: "Set my password",
    description:
      "Adds a password to an account that only signs in with Discord, Google or a magic link. Use the auth change-password endpoint when a password already exists.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Password set.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ hasPassword: z.literal(true) }))),
          },
        },
      },
      ...getOpenApiResponses({
        409: "The account already has a password.",
        422: "The request data failed validation.",
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

    await auth.api.setPassword({
      body: { newPassword: c.var.json.newPassword },
      headers: c.req.raw.headers,
    })

    return c.ok({ hasPassword: true })
  },
)
