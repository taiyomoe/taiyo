import { PAGE_REPORT_REASONS, PAGE_REPORT_STATUSES, sql } from "@taiyomoe/db"
import { getChapterPageKey, S3_PUBLIC_BASE } from "@taiyomoe/s3"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, storedLanguageSchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z.enum(PAGE_REPORT_STATUSES).default("OPEN").meta({
    description: "The status of the reports to list. Defaults to OPEN.",
    example: "OPEN",
  }),
})
const pageReportSchema = z.object({
  id: z.uuid().meta({
    description: "The ID of the report.",
    example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
  }),
  reason: z
    .enum(PAGE_REPORT_REASONS)
    .meta({ description: "What is wrong with the page.", example: "BROKEN" }),
  comment: z.string().nullable().meta({
    description: "The details given by the reporter, if any.",
    example: "The page is cut off halfway down.",
  }),
  status: z
    .enum(PAGE_REPORT_STATUSES)
    .meta({ description: "The status of the report.", example: "OPEN" }),
  createdAt: z.iso.datetime().meta({ description: "When the report was created." }),
  resolvedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the report was closed, if it was." }),
  page: z.int().nullable().meta({
    description:
      "The position of the page in the chapter, starting at 1, or null if the page was removed.",
    example: 7,
  }),
  pageId: z.uuid().meta({
    description: "The ID of the page.",
    example: "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  }),
  pageUrl: z.url().meta({ description: "The URL of the page image." }),
  samePageReports: z.int().meta({
    description: "The number of open reports on the same page, this one included if it is open.",
    example: 2,
  }),
  chapter: z
    .object({
      id: z.uuid().meta({ description: "The ID of the chapter." }),
      number: z.number().meta({ description: "The chapter number.", example: 112 }),
      title: z.string().nullable().meta({
        description: "The title of the chapter, if any.",
        example: "The Boy with the Sharingan",
      }),
      language: storedLanguageSchema("The language of the chapter."),
      mediaId: z.uuid().meta({ description: "The ID of the media the chapter belongs to." }),
      mediaTitle: z.string().nullable().meta({
        description: "The main title of the media, if any.",
        example: "Boruto: Naruto Next Generations",
      }),
    })
    .meta({ description: "The chapter the page belongs to." }),
  reporter: z
    .object({
      id: z.uuid().meta({ description: "The ID of the user." }),
      username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
      displayUsername: z
        .string()
        .meta({ description: "The display name of the user.", example: "Kaito" }),
    })
    .meta({ description: "The user who sent the report." }),
})

export const listPageReportsHandler = new Hono().get(
  "/page-reports",
  describeRoute({
    summary: "List page reports",
    description:
      "Lists the reports about broken or wrong chapter pages with the given status, oldest first for open reports and newest first otherwise.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Page reports"],
    responses: {
      200: {
        description: "The matching page reports.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(pageReportSchema.array(), paginationMetaSchema)),
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
