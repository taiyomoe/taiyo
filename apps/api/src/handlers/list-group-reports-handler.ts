import { GROUP_REPORT_REASONS, GROUP_REPORT_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(GROUP_REPORT_STATUSES)
    .default("PENDING")
    .meta({ description: "Only list reports with this status. Default: PENDING." }),
})
const itemSchema = z.object({
  id: z.uuid(),
  reason: z.enum(GROUP_REPORT_REASONS),
  details: z.string().nullable(),
  status: z.enum(GROUP_REPORT_STATUSES),
  reviewerNote: z.string().nullable(),
  group: groupSummarySchema,
  reporter: userSummarySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listGroupReportsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List group reports",
    description:
      "Lists reports filed against groups. Pending reports come oldest first so the queue is worked in order.\n\n**Required roles:** moderator, admin.",
    tags: ["Group reports"],
    responses: {
      200: {
        description: "Group reports.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("groupReport.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, status } = c.var.query
    const base = db
      .selectFrom("groupReports")
      .innerJoin("groups", "groups.id", "groupReports.groupId")
      .innerJoin("users", "users.id", "groupReports.reporterId")
      .where("groupReports.status", "=", status)
      .where("groups.deletedAt", "is", null)
    const [rows, totalRow] = await Promise.all([
      base
        .select([
          "groupReports.id",
          "groupReports.reason",
          "groupReports.details",
          "groupReports.status",
          "groupReports.reviewerNote",
          "groupReports.createdAt",
          "groupReports.updatedAt",
          "groups.id as groupId",
          "groups.name as groupName",
          "groups.logo as groupLogo",
          "users.id as userId",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
        ])
        .orderBy("groupReports.createdAt", status === "PENDING" ? "asc" : "desc")
        .orderBy("groupReports.id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        reason: row.reason,
        details: row.details,
        status: row.status,
        reviewerNote: row.reviewerNote,
        group: { id: row.groupId, name: row.groupName, logo: row.groupLogo },
        reporter: {
          id: row.userId,
          username: row.username,
          displayUsername: row.displayUsername,
          image: row.image,
          nameEffect: row.nameEffect,
          avatarBorder: row.avatarBorder,
        },
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
