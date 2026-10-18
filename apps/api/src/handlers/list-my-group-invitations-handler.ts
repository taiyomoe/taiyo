import { GROUP_PERMISSIONS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema, userSummarySchema } from "../utils/schemas"

const invitationSchema = z.object({
  id: z.uuid(),
  permissions: z.enum(GROUP_PERMISSIONS).array(),
  group: groupSummarySchema,
  inviter: userSummarySchema,
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
})

export const listMyGroupInvitationsHandler = new Hono().get(
  "/me/group-invitations",
  describeRoute({
    summary: "List my group invitations",
    description:
      "Lists the invitations to join a group that the current user has not answered yet and that have not expired, newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Pending invitations.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(invitationSchema.array())) },
        },
      },
      ...getOpenApiResponses(),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var
    const rows = await db
      .selectFrom("groupInvitations")
      .innerJoin("groups", "groups.id", "groupInvitations.groupId")
      .innerJoin("users as inviter", "inviter.id", "groupInvitations.inviterId")
      .select([
        "groupInvitations.id",
        "groupInvitations.permissions",
        "groupInvitations.expiresAt",
        "groupInvitations.createdAt",
        "groups.id as groupId",
        "groups.name as groupName",
        "groups.logo as groupLogo",
        "inviter.id as inviterId",
        "inviter.username as inviterUsername",
        "inviter.displayUsername as inviterDisplayUsername",
        "inviter.image as inviterImage",
      ])
      .where("groupInvitations.inviteeId", "=", user.id)
      .where("groupInvitations.status", "=", "PENDING")
      .where("groupInvitations.expiresAt", ">", sql<Date>`CURRENT_TIMESTAMP`)
      .where("groups.deletedAt", "is", null)
      .orderBy("groupInvitations.createdAt", "desc")
      .execute()

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        permissions: row.permissions,
        group: { id: row.groupId, name: row.groupName, logo: row.groupLogo },
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
