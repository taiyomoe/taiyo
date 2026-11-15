import { GROUP_MEMBERSHIP_ROLES, GROUP_PERMISSIONS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { publishedChapters } from "../utils/group-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const { id: userId, ...userFields } = userSummarySchema.shape
const memberItemSchema = z.object({
  userId,
  ...userFields,
  role: z
    .enum(GROUP_MEMBERSHIP_ROLES)
    .meta({ description: "The role of the member in the group.", example: "MEMBER" }),
  permissions: z
    .enum(GROUP_PERMISSIONS)
    .array()
    .nullable()
    .meta({
      description:
        "The group permissions stored for the member, if you can manage the group's members. An owner holds every permission whatever this list says.",
      example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
    }),
  chapterCount: z.int().meta({
    description:
      "The number of published chapters the member uploaded that are credited to the group.",
    example: 87,
  }),
  createdAt: z.iso.datetime().meta({ description: "When the user joined the group." }),
})

export const listGroupMembersHandler = new Hono().get(
  "/:id/members",
  describeRoute({
    summary: "List a group's members",
    description:
      "Lists the members of the group, owners first, then alphabetically by username. Signed-in viewers who can manage the group's members also see each member's permissions.\n\n**Authentication:** optional.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "The members of the group.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(memberItemSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withOptionalAuth,
  checkGroup(),
  async (c) => {
    const { can, db, group } = c.var
    const showPermissions = can("group.manageMembers", { id: group.id })
    const [rows, counts] = await Promise.all([
      db
        .selectFrom("groupMemberships")
        .innerJoin("users", "users.id", "groupMemberships.userId")
        .where("groupMemberships.groupId", "=", group.id)
        .select([
          "users.id as userId",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
          "groupMemberships.role",
          "groupMemberships.permissions",
          "groupMemberships.createdAt",
        ])
        .orderBy("groupMemberships.role", "asc")
        .orderBy("users.username", "asc")
        .execute(),
      publishedChapters(db, group.id)
        .where("chapters.uploaderId", "in", (eb) =>
          eb
            .selectFrom("groupMemberships")
            .select("groupMemberships.userId")
            .where("groupMemberships.groupId", "=", group.id),
        )
        .groupBy("chapters.uploaderId")
        .select(["chapters.uploaderId", sql<string>`count(*)`.as("count")])
        .execute(),
    ])
    const chapterCounts = new Map(counts.map((row) => [row.uploaderId, Number(row.count)]))

    return c.ok(
      rows.map((row) => ({
        ...row,
        chapterCount: chapterCounts.get(row.userId) ?? 0,
        permissions: showPermissions ? row.permissions : null,
      })),
    )
  },
)
