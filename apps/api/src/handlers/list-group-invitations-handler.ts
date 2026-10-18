import { GROUP_PERMISSIONS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const invitationSchema = z.object({
  id: z.uuid(),
  permissions: z.enum(GROUP_PERMISSIONS).array(),
  invitee: userSummarySchema,
  inviter: userSummarySchema,
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
})

export const listGroupInvitationsHandler = new Hono().get(
  "/:id/invitations",
  describeRoute({
    summary: "List a group's pending invitations",
    description:
      "Lists the invitations of the group that are still waiting for an answer and have not expired, newest first.\n\n**Authentication:** group owner, member with `MANAGE_MEMBERS`, admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Pending invitations.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(invitationSchema.array())) },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkGroup(),
  authorizeGroup("manageMembers"),
  async (c) => {
    const { db, group } = c.var
    const rows = await db
      .selectFrom("groupInvitations")
      .innerJoin("users as invitee", "invitee.id", "groupInvitations.inviteeId")
      .innerJoin("users as inviter", "inviter.id", "groupInvitations.inviterId")
      .select([
        "groupInvitations.id",
        "groupInvitations.permissions",
        "groupInvitations.expiresAt",
        "groupInvitations.createdAt",
        "invitee.id as inviteeId",
        "invitee.username as inviteeUsername",
        "invitee.displayUsername as inviteeDisplayUsername",
        "invitee.image as inviteeImage",
        "inviter.id as inviterId",
        "inviter.username as inviterUsername",
        "inviter.displayUsername as inviterDisplayUsername",
        "inviter.image as inviterImage",
      ])
      .where("groupInvitations.groupId", "=", group.id)
      .where("groupInvitations.status", "=", "PENDING")
      .where("groupInvitations.expiresAt", ">", sql<Date>`CURRENT_TIMESTAMP`)
      .orderBy("groupInvitations.createdAt", "desc")
      .execute()

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        permissions: row.permissions,
        invitee: {
          id: row.inviteeId,
          username: row.inviteeUsername,
          displayUsername: row.inviteeDisplayUsername,
          image: row.inviteeImage,
        },
        inviter: {
          id: row.inviterId,
          username: row.inviterUsername,
          displayUsername: row.inviterDisplayUsername,
          image: row.inviterImage,
        },
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
      })),
    )
  },
)
