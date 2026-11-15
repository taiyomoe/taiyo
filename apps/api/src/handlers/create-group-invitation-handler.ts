import { groupInvitationAudit } from "@taiyomoe/audit"
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
import { audited } from "../middlewares/audited-middleware"
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
    .meta({ description: "The username of the user to invite.", example: "kaito" }),
  permissions: groupPermissionsSchema.default([]).meta({
    description: "The group permissions the user gets on joining. Defaults to none.",
    example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
  }),
})

export const createGroupInvitationHandler = new Hono().post(
  "/:id/invitations",
  describeRoute({
    summary: "Invite a user to a group",
    description: `Invites a user to the group by username, with the group permissions they get on joining. The user answers from their dashboard, gets an email if their address is verified, and has ${INVITATION_LIFETIME_DAYS} days to answer. A member with the \`MANAGE_MEMBERS\` permission can only grant permissions they hold, and never \`MANAGE_MEMBERS\`.\n\n**Required access:** the group owner, a member with the \`MANAGE_MEMBERS\` permission, or admin.`,
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation sent.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the invitation." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You cannot invite members to the group or grant these permissions, or your account is banned.",
        404: "No group with the given ID exists, or no user has this username.",
        409: "The user is already a member of the group, or already has a pending invitation to it.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(groupInvitationAudit.CREATE, (c) => ({ groupId: c.req.param("id") })),
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

    const result = await withGroupLock(db, group.id, async (trx) => {
      const locked = await getLockedPermissions(trx, actor, group.id)

      if (!locked("group.inviteMember", { groupId: group.id, permissions })) {
        return { ok: false, error: "FORBIDDEN" } as const
      }

      if ((await getMembership(trx, group.id, invitee.id)) !== undefined) {
        return { ok: false, error: "GROUP_MEMBER_EXISTS" } as const
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
        return { ok: false, error: "GROUP_INVITATION_EXISTS" } as const
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

      return { ok: true, id: row.id } as const
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    log.set({ invitation: { id: result.id, inviteeId: invitee.id } })
    c.var.audit.set({ target: { id: result.id, inviteeId: invitee.id, permissions } })

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
