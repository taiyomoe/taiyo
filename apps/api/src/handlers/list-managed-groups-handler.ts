import { sql } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { escapeLike } from "../utils/escape-like"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description: "Only list the groups whose name contains this text, ignoring case.",
    example: "akira",
  }),
  owned: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
    .meta({
      description: "Only list the groups that have an owner (`true`) or that have none (`false`).",
      example: "false",
    }),
})
const managedGroupSchema = groupSummarySchema.omit({ logo: true }).extend({
  logoUrl: z.url().nullable().meta({ description: "The URL of the group's logo, if any." }),
  createdAt: z.iso.datetime().meta({ description: "When the group was created." }),
  memberCount: z
    .int()
    .meta({ description: "The number of members of the group, owners included.", example: 8 }),
  chapterCount: z
    .int()
    .meta({ description: "The number of chapters credited to the group.", example: 342 }),
  followerCount: z
    .int()
    .meta({ description: "The number of users who follow the group.", example: 120 }),
  owner: userSummarySchema
    .nullable()
    .meta({ description: "The first owner of the group, if it has one." }),
})

export const listManagedGroupsHandler = new Hono().get(
  "/managed",
  describeRoute({
    summary: "List groups for management",
    description:
      "Lists the groups for management, newest first, with their owner and their number of members, chapters and followers.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The matching groups.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedGroupSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("group.list"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, owned } = c.var.query
    const base = db
      .selectFrom("groups")
      .where("groups.deletedAt", "is", null)
      .where((eb) =>
        search === undefined ? eb.and([]) : eb("groups.name", "ilike", `%${escapeLike(search)}%`),
      )
      .where((eb) => {
        if (owned === undefined) {
          return eb.and([])
        }

        const hasOwner = eb.exists(
          eb
            .selectFrom("groupMemberships")
            .select("groupMemberships.userId")
            .whereRef("groupMemberships.groupId", "=", "groups.id")
            .where("groupMemberships.role", "=", "OWNER"),
        )

        return owned ? hasOwner : eb.not(hasOwner)
      })
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "groups.id",
          "groups.name",
          "groups.logo",
          "groups.createdAt",
          eb
            .selectFrom("groupMemberships")
            .select(sql<number>`count(*)::int`.as("count"))
            .whereRef("groupMemberships.groupId", "=", "groups.id")
            .as("memberCount"),
          eb
            .selectFrom("chapterGroups")
            .innerJoin("chapters", "chapters.id", "chapterGroups.chapterId")
            .select(sql<number>`count(*)::int`.as("count"))
            .whereRef("chapterGroups.groupId", "=", "groups.id")
            .where("chapters.deletedAt", "is", null)
            .as("chapterCount"),
          eb
            .selectFrom("groupFollows")
            .select(sql<number>`count(*)::int`.as("count"))
            .whereRef("groupFollows.groupId", "=", "groups.id")
            .as("followerCount"),
        ])
        .orderBy("groups.createdAt", "desc")
        .orderBy("groups.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const owners =
      rows.length === 0
        ? []
        : await db
            .selectFrom("groupMemberships")
            .innerJoin("users", "users.id", "groupMemberships.userId")
            .distinctOn("groupMemberships.groupId")
            .select([
              "groupMemberships.groupId",
              "users.id",
              "users.username",
              "users.displayUsername",
              "users.image",
              "users.nameEffect",
              "users.avatarBorder",
            ])
            .where(
              "groupMemberships.groupId",
              "in",
              rows.map((row) => row.id),
            )
            .where("groupMemberships.role", "=", "OWNER")
            .orderBy("groupMemberships.groupId")
            .orderBy("groupMemberships.createdAt", "asc")
            .orderBy("users.id", "asc")
            .execute()
    const ownerByGroup = new Map(owners.map(({ groupId, ...owner }) => [groupId, owner]))

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        logoUrl: row.logo === null ? null : getPublicImageUrl(row.logo),
        createdAt: row.createdAt,
        memberCount: row.memberCount ?? 0,
        chapterCount: row.chapterCount ?? 0,
        followerCount: row.followerCount ?? 0,
        owner: ownerByGroup.get(row.id) ?? null,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
