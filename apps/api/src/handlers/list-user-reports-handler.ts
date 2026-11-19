import { isBannedSql, sql, USER_REPORT_REASONS, USER_REPORT_STATUSES } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"
import { managedUserSchema } from "../utils/user-moderation"

const querySchema = paginationQuerySchema.extend({
  status: z.enum(USER_REPORT_STATUSES).default("PENDING").meta({
    description: "Only list reports with this status. Defaults to `PENDING`.",
    example: "PENDING",
  }),
  reason: z.enum(USER_REPORT_REASONS).optional().meta({
    description: "Only list reports given this reason. Lists every reason when omitted.",
    example: "INAPPROPRIATE_PROFILE",
  }),
})
const itemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the report." }),
  reason: z
    .enum(USER_REPORT_REASONS)
    .meta({ description: "Why the user was reported.", example: "INAPPROPRIATE_PROFILE" }),
  details: z.string().nullable().meta({
    description: "The details given by the reporter, if any.",
    example: "Their avatar and about text are insulting.",
  }),
  status: z
    .enum(USER_REPORT_STATUSES)
    .meta({ description: "The status of the report.", example: "PENDING" }),
  reviewerNote: z.string().nullable().meta({
    description: "The note the moderator left when reviewing the report, if any.",
    example: "Removed the avatar and the about text.",
  }),
  user: userSummarySchema.extend(managedUserSchema.pick({ role: true, banned: true }).shape).meta({
    description: "The reported user, with the role and ban that decide who can act on them.",
  }),
  reporter: userSummarySchema.meta({ description: "The user who filed the report." }),
  createdAt: z.iso.datetime().meta({ description: "When the report was filed." }),
  updatedAt: z.iso.datetime().meta({ description: "When the report was last updated." }),
})

export const listUserReportsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List user reports",
    description:
      "Lists the reports on users with the given status, and reason when given. Pending reports come oldest first so the queue is worked in order, others newest first.\n\n**Required roles:** moderator, admin.",
    tags: ["User reports"],
    responses: {
      200: {
        description: "The matching user reports.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
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
  withAuth("userReport.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, status, reason } = c.var.query
    const base = db
      .selectFrom("userReports")
      .innerJoin("users", "users.id", "userReports.userId")
      .innerJoin("users as reporter", "reporter.id", "userReports.reporterId")
      .where("userReports.status", "=", status)
      .where((eb) => eb.and(reason === undefined ? [] : [eb("userReports.reason", "=", reason)]))
    const [rows, totalRow] = await Promise.all([
      base
        .select([
          "userReports.id",
          "userReports.reason",
          "userReports.details",
          "userReports.status",
          "userReports.reviewerNote",
          "userReports.createdAt",
          "userReports.updatedAt",
          "users.id as userId",
          "users.username as userUsername",
          "users.displayUsername as userDisplayUsername",
          "users.image as userImage",
          "users.nameEffect as userNameEffect",
          "users.avatarBorder as userAvatarBorder",
          "users.role as userRole",
          isBannedSql.as("userBanned"),
          "reporter.id as reporterId",
          "reporter.username as reporterUsername",
          "reporter.displayUsername as reporterDisplayUsername",
          "reporter.image as reporterImage",
          "reporter.nameEffect as reporterNameEffect",
          "reporter.avatarBorder as reporterAvatarBorder",
        ])
        .orderBy("userReports.createdAt", status === "PENDING" ? "asc" : "desc")
        .orderBy("userReports.id", "asc")
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
        user: {
          id: row.userId,
          username: row.userUsername,
          displayUsername: row.userDisplayUsername,
          image: row.userImage,
          nameEffect: row.userNameEffect,
          avatarBorder: row.userAvatarBorder,
          role: row.userRole,
          banned: row.userBanned,
        },
        reporter: {
          id: row.reporterId,
          username: row.reporterUsername,
          displayUsername: row.reporterDisplayUsername,
          image: row.reporterImage,
          nameEffect: row.reporterNameEffect,
          avatarBorder: row.reporterAvatarBorder,
        },
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
