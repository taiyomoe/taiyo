import { sql } from "@taiyomoe/db"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { getMembership, normalizeGroupPermissions, withGroupLock } from "../group-membership"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })

export const acceptGroupInvitationHandler = new Hono().post(
  "/:id/accept",
  describeRoute({
    summary: "Accept a group invitation",
    description:
      "Joins the group with the permissions from the invitation. Refused if the invitation expired, or if the person who sent it can no longer grant those permissions.\n\n**Authentication:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation accepted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid(), groupId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No invitation with the given id was sent to you.",
        409: "The invitation was already answered, expired or is no longer valid, or you are already a member.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
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
