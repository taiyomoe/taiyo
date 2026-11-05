import { LANGUAGES, PAGE_REPORT_REASONS, PAGE_REPORT_STATUSES, sql } from "@taiyomoe/db"
import { getChapterPageKey, S3_PUBLIC_BASE } from "@taiyomoe/s3"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(PAGE_REPORT_STATUSES)
    .default("OPEN")
    .meta({ description: "Which reports to list.", example: "OPEN" }),
})
const pageReportSchema = z.object({
  id: z.uuid(),
  reason: z.enum(PAGE_REPORT_REASONS),
  comment: z.string().nullable(),
  status: z.enum(PAGE_REPORT_STATUSES),
  createdAt: z.iso.datetime(),
  resolvedAt: z.iso.datetime().nullable(),
  page: z
    .int()
    .nullable()
    .meta({ description: "The page's position in the chapter, or null if it was removed." }),
  pageId: z.uuid(),
  pageUrl: z.url(),
  samePageReports: z
    .int()
    .meta({ description: "How many open reports, this one included, point at the same page." }),
  chapter: z.object({
    id: z.uuid(),
    number: z.number(),
    title: z.string().nullable(),
    language: z.enum(LANGUAGES),
    mediaId: z.uuid(),
    mediaTitle: z.string().nullable(),
  }),
  reporter: z.object({ id: z.uuid(), username: z.string(), displayUsername: z.string() }),
})

export const listPageReportsHandler = new Hono().get(
  "/page-reports",
  describeRoute({
    summary: "List page reports",
    description:
      "Lists reports about broken or wrong chapter pages, oldest first for open reports and newest first otherwise.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Page reports"],
    responses: {
      200: {
        description: "Page reports.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(pageReportSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("pageReport.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, status } = c.var.query
    const base = db
      .selectFrom("pageReports")
      .innerJoin("chapters", "chapters.id", "pageReports.chapterId")
      .innerJoin("users", "users.id", "pageReports.reporterId")
      .where("pageReports.status", "=", status)
      .where("chapters.deletedAt", "is", null)
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "pageReports.id",
          "pageReports.reason",
          "pageReports.comment",
          "pageReports.status",
          "pageReports.createdAt",
          "pageReports.resolvedAt",
          "pageReports.pageId",
          "chapters.id as chapterId",
          "chapters.number",
          "chapters.title",
          "chapters.language",
          "chapters.mediaId",
          "users.id as reporterId",
          "users.username",
          "users.displayUsername",
          sql<
            number | null
          >`(select ${sql.ref("p.ord")}::int from unnest(${sql.ref("chapters.pages")}) with ordinality as p(page, ord) where ${sql.ref("p.page")}->>'id' = ${sql.ref("pageReports.pageId")}::text)`.as(
            "page",
          ),
          eb
            .selectFrom("pageReports as same")
            .select(sql<string>`count(*)`.as("count"))
            .whereRef("same.chapterId", "=", "pageReports.chapterId")
            .whereRef("same.pageId", "=", "pageReports.pageId")
            .where("same.status", "=", "OPEN")
            .as("samePageReports"),
        ])
        .orderBy("pageReports.createdAt", status === "OPEN" ? "asc" : "desc")
        .orderBy("pageReports.id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const titles = await getMainTitles(db, [...new Set(rows.map((row) => row.mediaId))])

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        reason: row.reason,
        comment: row.comment,
        status: row.status,
        createdAt: row.createdAt,
        resolvedAt: row.resolvedAt,
        page: row.page,
        pageId: row.pageId,
        pageUrl: `${S3_PUBLIC_BASE}/${getChapterPageKey(row.mediaId, row.chapterId, row.pageId)}`,
        samePageReports: Number(row.samePageReports ?? 0),
        chapter: {
          id: row.chapterId,
          number: row.number,
          title: row.title,
          language: row.language,
          mediaId: row.mediaId,
          mediaTitle: titles.get(row.mediaId) ?? null,
        },
        reporter: {
          id: row.reporterId,
          username: row.username,
          displayUsername: row.displayUsername,
        },
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
