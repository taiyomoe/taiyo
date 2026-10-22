import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { corsAllowedOrigins } from "../env"
import {
  getLockedPermissions,
  getMembership,
  INVITATION_LIFETIME_DAYS,
  normalizeGroupPermissions,
  withGroupLock,
} from "../group-membership"
import { checkGroup } from "../middlewares/check-group-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupPermissionsSchema } from "../utils/schemas"

const createInvitationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(config.auth.username.minLength)
    .max(config.auth.username.maxLength)
    .meta({ description: "Username of the person to invite.", example: "kaito" }),
  permissions: groupPermissionsSchema.default([]),
})

export const createGroupInvitationHandler = new Hono().post(
  "/:id/invitations",
  describeRoute({
    summary: "Invite someone to a group",
    description: `Invites a user to the group by username with a set of group permissions. The invitee accepts or declines from their dashboard, and gets an email if they have a verified address. Invitations expire after ${INVITATION_LIFETIME_DAYS} days. Members with \`MANAGE_MEMBERS\` can only grant permissions they hold, never \`MANAGE_MEMBERS\`.\n\n**Authentication:** group owner, member with \`MANAGE_MEMBERS\`, admin.`,
    tags: ["Group members"],
    requestBody: {
      content: { "application/json": await resolver(createInvitationSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Invitation sent.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists, or no user has this username.",
        409: "The user is already a member or already has a pending invitation.",
        422: "The request data failed validation.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  withAuth(),
  rateLimit({ prefix: "group-invitation", windowMs: 60_000, limit: 30 }),
  validateJson(createInvitationSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { actor, can, db, group, log, mailer, user } = c.var
    const permissions = normalizeGroupPermissions(c.var.json.permissions)

    if (!can("group.inviteMember", { groupId: group.id, permissions: [] })) {
      return c.fail("FORBIDDEN")
    }

    const invitee = await db
      .selectFrom("users")
      .select(["id", "name", "email", "emailVerified"])
      .where("username", "=", c.var.json.username.toLowerCase())
      .where((eb) => eb.or([eb("banned", "is", null), eb("banned", "=", false)]))
      .executeTakeFirst()

    if (invitee === undefined) {
      return c.fail("USER_NOT_FOUND")
    }

    const result = await withGroupLock<
      | { ok: true; id: string }
      | { ok: false; error: "FORBIDDEN" | "GROUP_MEMBER_EXISTS" | "GROUP_INVITATION_EXISTS" }
    >(db, group.id, async (trx) => {
      const locked = await getLockedPermissions(trx, actor, group.id)

      if (!locked("group.inviteMember", { groupId: group.id, permissions })) {
        return { ok: false, error: "FORBIDDEN" }
      }

      if ((await getMembership(trx, group.id, invitee.id)) !== undefined) {
        return { ok: false, error: "GROUP_MEMBER_EXISTS" }
      }

      await trx
        .updateTable("groupInvitations")
        .set({ status: "EXPIRED" })
        .where("groupId", "=", group.id)
        .where("inviteeId", "=", invitee.id)
        .where("status", "=", "PENDING")
        .where("expiresAt", "<=", sql<Date>`CURRENT_TIMESTAMP`)
        .execute()

      const pending = await trx
        .selectFrom("groupInvitations")
        .select("id")
        .where("groupId", "=", group.id)
        .where("inviteeId", "=", invitee.id)
        .where("status", "=", "PENDING")
        .executeTakeFirst()

      if (pending !== undefined) {
        return { ok: false, error: "GROUP_INVITATION_EXISTS" }
      }

      const row = await trx
        .insertInto("groupInvitations")
        .values({
          groupId: group.id,
          inviteeId: invitee.id,
          inviterId: actor.id,
          permissions,
          expiresAt: sql<Date>`CURRENT_TIMESTAMP + ${sql.raw(`interval '${INVITATION_LIFETIME_DAYS} days'`)}`,
        })
        .returning("id")
        .executeTakeFirstOrThrow()

      return { ok: true, id: row.id }
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    log.set({ invitation: { id: result.id, inviteeId: invitee.id } })

    if (invitee.email !== null && invitee.email !== "" && invitee.emailVerified) {
      const email = invitee.email
      const origin = corsAllowedOrigins[0]

      c.var.afterCommit(() =>
        mailer.sendGroupInvitation({
          to: email,
          name: invitee.name,
          inviterName: user.name,
          groupName: group.name,
          expiresInDays: INVITATION_LIFETIME_DAYS,
          url: origin === undefined ? null : `${origin}/dashboard/invitations`,
        }),
      )
    }

    return c.ok({ id: result.id })
  },
)
