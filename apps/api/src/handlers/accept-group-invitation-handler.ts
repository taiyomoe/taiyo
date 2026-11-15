import { groupInvitationAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { getMembership, normalizeGroupPermissions, withGroupLock } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the invitation." }) })

export const acceptGroupInvitationHandler = new Hono().post(
  "/:id/accept",
  describeRoute({
    summary: "Accept a group invitation",
    description:
      "Accepts an invitation sent to you, and joins the group with the permissions it grants. It fails if the invitation expired, or if its sender can no longer grant those permissions.\n\n**Required access:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation accepted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the invitation." }),
                  groupId: z.uuid().meta({ description: "The ID of the group you joined." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No invitation with the given ID was sent to you, or its group no longer exists.",
        409: "The invitation is no longer pending or has expired, or its sender can no longer grant its permissions, or you are already a member of the group.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupInvitationAudit.ACCEPT),
  withAuth(),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const found = await db
      .selectFrom("groupInvitations")
      .select("groupId")
      .where("id", "=", id)
      .where("inviteeId", "=", user.id)
      .executeTakeFirst()

    if (found === undefined) {
      return c.fail("GROUP_INVITATION_NOT_FOUND")
    }

    const { groupId } = found

    c.var.audit.set({ target: { groupId } })

    const result = await withGroupLock(db, groupId, async (trx) => {
      const invitation = await trx
        .selectFrom("groupInvitations")
        .select([
          "inviterId",
          "permissions",
          "status",
          sql<boolean>`"expiresAt" <= CURRENT_TIMESTAMP`.as("expired"),
        ])
        .where("id", "=", id)
        .executeTakeFirstOrThrow()

      if (invitation.status !== "PENDING") {
        return { ok: false, error: "GROUP_INVITATION_NOT_PENDING" } as const
      }

      if (invitation.expired) {
        return { ok: false, error: "GROUP_INVITATION_EXPIRED" } as const
      }

      const [inviter, inviterMembership] = await Promise.all([
        trx
          .selectFrom("users")
          .select(["role", "banned"])
          .where("id", "=", invitation.inviterId)
          .executeTakeFirst(),
        getMembership(trx, groupId, invitation.inviterId),
      ])

      if (
        inviter === undefined ||
        !createPermissions({
          id: invitation.inviterId,
          role: toRole(inviter.role),
          banned: inviter.banned === true,
          memberships: inviterMembership === undefined ? [] : [inviterMembership],
        })("group.inviteMember", { groupId, permissions: invitation.permissions })
      ) {
        return { ok: false, error: "GROUP_INVITATION_INVALID" } as const
      }

      if ((await getMembership(trx, groupId, user.id)) !== undefined) {
        return { ok: false, error: "GROUP_MEMBER_EXISTS" } as const
      }

      await trx
        .insertInto("groupMemberships")
        .values({
          groupId,
          userId: user.id,
          role: "MEMBER",
          permissions: normalizeGroupPermissions(invitation.permissions),
          addedBy: invitation.inviterId,
        })
        .execute()

      await trx
        .updateTable("groupInvitations")
        .set({ status: "ACCEPTED" })
        .where("id", "=", id)
        .execute()

      return { ok: true } as const
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id, groupId })
  },
)
