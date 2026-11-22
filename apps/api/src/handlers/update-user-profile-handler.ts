import { adminAudit } from "@taiyomoe/audit"
import { PROFILE_MODERATION_FIELDS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeUser } from "../middlewares/authorize-user-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { isUniqueViolation } from "../utils/database-errors"
import { notifyModeration } from "../utils/notifications/moderation"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import {
  apiSuccessEnvelope,
  displayNameSchema,
  profileAboutSchema,
  profileCitySchema,
  storedLocalizedTextSchema,
} from "../utils/schemas"

const bodySchema = z
  .object({
    displayUsername: displayNameSchema.optional().meta({
      description:
        "The name shown next to the user's content. It stays unique across Taiyō, ignoring case.",
      example: "Sunny Reader",
    }),
    about: profileAboutSchema.optional().meta({
      description:
        "The about text of the user's profile, keyed by language, replacing the current one. Languages you omit or send as an empty string are removed.",
      example: { en: "Reading isekai since 2015." },
    }),
    city: profileCitySchema.nullable().optional().meta({
      description: "The city the user lives in, or null or an empty string to remove it.",
      example: "Lisbon",
    }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })
const profileSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the user." }),
  displayUsername: z
    .string()
    .meta({ description: "The display name of the user.", example: "Sunny Reader" }),
  about: storedLocalizedTextSchema.meta({
    description: "The about text of the user's profile, keyed by language.",
    example: { en: "Reading isekai since 2015." },
  }),
  city: z
    .string()
    .nullable()
    .meta({ description: "The city the user lives in, if any.", example: "Lisbon" }),
})

export const updateUserProfileHandler = new Hono().patch(
  "/:id/profile",
  describeRoute({
    summary: "Update a user's profile",
    description:
      "Updates the display name, about text or city of a user's profile, and leaves the omitted ones unchanged. Send at least one field. The user is notified of the parts that changed. Moderators can only edit users with the `USER` role, and you cannot edit your own profile this way.\n\n**Required roles:** moderator, admin.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Profile updated.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(profileSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not a moderator or admin, you are a moderator and the user is not a regular user, or the user is you.",
        404: "No user with the given ID exists.",
        409: "The display name is already taken.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(adminAudit.USER_PROFILE_UPDATE),
  withAuth(),
  authorizeUser("moderateProfile"),
  validateJson(bodySchema),
  checkUser({ includeBanned: true }),
  withTransaction,
  async (c) => {
    const { auth, can, db, targetUser } = c.var
    const { displayUsername, about, city } = c.var.json

    if (!can("user.moderateProfile", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    if (displayUsername !== undefined) {
      const taken = await db
        .selectFrom("users")
        .select("id")
        .where(sql`lower(${sql.ref("displayUsername")})`, "=", displayUsername.toLowerCase())
        .where("id", "!=", targetUser.id)
        .executeTakeFirst()

      if (taken !== undefined) {
        return c.fail("DISPLAY_NAME_TAKEN")
      }
    }

    const before = await db
      .selectFrom("userProfiles")
      .select(["about", "city"])
      .where("userId", "=", targetUser.id)
      .forUpdate()
      .executeTakeFirst()
    const patch = {
      ...(about === undefined
        ? {}
        : { about: Object.fromEntries(Object.entries(about).filter(([, text]) => text !== "")) }),
      ...(city === undefined ? {} : { city: city === "" ? null : city }),
    }
    const changes = auditChanges(
      { displayUsername: targetUser.displayUsername, ...before },
      { ...(displayUsername === undefined ? {} : { displayUsername }), ...patch },
    )
    const changed = new Set(changes?.patch?.map((op) => op.path.split("/")[1]))
    const fields = PROFILE_MODERATION_FIELDS.filter((field) => changed.has(field))

    c.var.audit.set({ changes })

    if (displayUsername !== undefined) {
      try {
        await db
          .updateTable("users")
          .set({ displayUsername, name: displayUsername })
          .where("id", "=", targetUser.id)
          .execute()
      } catch (err) {
        if (isUniqueViolation(err, "users_displayUsername_lower_key")) {
          return c.fail("DISPLAY_NAME_TAKEN")
        }

        throw err
      }

      c.var.afterCommit(() => refreshUserSessions(auth, targetUser.id))
    }

    const row = { userId: targetUser.id, ...patch }
    const profile =
      Object.keys(patch).length === 0
        ? before
        : await db
            .insertInto("userProfiles")
            .values(row)
            .onConflict((oc) => oc.column("userId").doUpdateSet(row))
            .returning(["about", "city"])
            .executeTakeFirstOrThrow()

    if (fields.length > 0) {
      await notifyModeration(c.var, [
        { type: "PROFILE_MODERATED", userId: targetUser.id, payload: { fields } },
      ])
    }

    return c.ok({
      id: targetUser.id,
      displayUsername: displayUsername ?? targetUser.displayUsername,
      about: profile?.about ?? {},
      city: profile?.city ?? null,
    })
  },
)
