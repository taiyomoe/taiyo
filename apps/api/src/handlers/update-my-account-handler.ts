import { userAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  username: z
    .string()
    .trim()
    .regex(config.auth.username.regex)
    .optional()
    .meta({ description: "The handle used in your profile URL.", example: "sunny_reader" }),
  displayName: z
    .string()
    .trim()
    .regex(config.auth.displayName.regex)
    .optional()
    .meta({ description: "The name shown next to your content.", example: "Sunny Reader" }),
})
const accountSchema = z.object({
  username: z.string(),
  displayUsername: z.string(),
  name: z.string(),
})

export const updateMyAccountHandler = new Hono().patch(
  "/me/account",
  describeRoute({
    summary: "Update my account",
    description:
      "Changes your username or display name. Both stay unique across Taiyō, ignoring case.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Account updated.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(accountSchema)) } },
      },
      ...getOpenApiResponses({
        409: "The username or display name is already taken.",
        422: "The request data failed validation.",
      }),
    },
  }),
  audited(userAudit.ACCOUNT_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { auth, db, user } = c.var
    const { username, displayName } = c.var.json
    const before = await db
      .selectFrom("users")
      .select(["username", "displayUsername", "name"])
      .where("id", "=", user.id)
      .forUpdate()
      .executeTakeFirstOrThrow()
    const patch = {
      ...(username === undefined ? {} : { username: username.toLowerCase() }),
      ...(displayName === undefined ? {} : { displayUsername: displayName, name: displayName }),
    }

    if (patch.username !== undefined && patch.username !== before.username) {
      const taken = await db
        .selectFrom("users")
        .select("id")
        .where("username", "=", patch.username)
        .where("id", "!=", user.id)
        .executeTakeFirst()

      if (taken !== undefined) {
        return c.fail("USERNAME_TAKEN")
      }
    }

    if (patch.displayUsername !== undefined) {
      const taken = await db
        .selectFrom("users")
        .select("id")
        .where(sql`lower(${sql.ref("displayUsername")})`, "=", patch.displayUsername.toLowerCase())
        .where("id", "!=", user.id)
        .executeTakeFirst()

      if (taken !== undefined) {
        return c.fail("DISPLAY_NAME_TAKEN")
      }
    }

    c.var.audit.set({ changes: auditChanges(before, patch) })

    const updated = await db
      .updateTable("users")
      .set(patch)
      .where("id", "=", user.id)
      .returning(["username", "displayUsername", "name"])
      .executeTakeFirstOrThrow()

    c.var.afterCommit(() => refreshUserSessions(auth, user.id))

    return c.ok(updated)
  },
)
