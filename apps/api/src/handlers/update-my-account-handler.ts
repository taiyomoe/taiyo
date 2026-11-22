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
import { isUniqueViolation } from "../utils/database-errors"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope, displayNameSchema } from "../utils/schemas"

const bodySchema = z.object({
  username: z.string().trim().regex(config.auth.username.regex).optional().meta({
    description: "The handle used in your profile URL. It is saved in lowercase.",
    example: "sunny_reader",
  }),
  displayName: displayNameSchema
    .optional()
    .meta({ description: "The name shown next to your content.", example: "Sunny Reader" }),
})
const accountSchema = z.object({
  username: z.string().meta({ description: "Your username.", example: "sunny_reader" }),
  displayUsername: z.string().meta({ description: "Your display name.", example: "Sunny Reader" }),
  name: z.string().meta({
    description: "Your display name, as the auth endpoints return it.",
    example: "Sunny Reader",
  }),
})

export const updateMyAccountHandler = new Hono().patch(
  "/me/account",
  describeRoute({
    summary: "Update my account",
    description:
      "Updates your username, your display name, or both, and leaves the omitted one unchanged. Both stay unique across Taiyō, ignoring case.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      200: {
        description: "Account updated.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(accountSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        409: "The username or the display name is already taken.",
        422: "The request body failed validation.",
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

    if (Object.keys(patch).length === 0) {
      return c.ok(before)
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

    // Same columns as `before`.
    let updated: typeof before

    try {
      updated = await db
        .updateTable("users")
        .set(patch)
        .where("id", "=", user.id)
        .returning(["username", "displayUsername", "name"])
        .executeTakeFirstOrThrow()
    } catch (err) {
      // Two requests can pass the checks above at the same moment: the indexes decide.
      if (isUniqueViolation(err, "users_username_key")) {
        return c.fail("USERNAME_TAKEN")
      }

      if (isUniqueViolation(err, "users_displayUsername_lower_key")) {
        return c.fail("DISPLAY_NAME_TAKEN")
      }

      throw err
    }

    c.var.afterCommit(() => refreshUserSessions(auth, user.id))

    return c.ok(updated)
  },
)
