import { chapterReportAudit } from "@taiyomoe/audit"
import { PAGE_REPORT_REASONS } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  pageId: z.uuid().meta({
    description: "The ID of the page.",
    example: "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  }),
})
const bodySchema = z.object({
  reason: z.enum(PAGE_REPORT_REASONS).meta({
    description:
      "What is wrong with the page: BROKEN when the image does not load, WRONG_ORDER when the pages are out of order, WRONG_CHAPTER when the page belongs to another chapter, LOW_QUALITY when the image is unreadable, or OTHER.",
    example: "BROKEN",
  }),
  comment: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .meta({
      description: "Details for whoever fixes the page, up to 500 characters. Blank means none.",
      example: "The page is cut off halfway down.",
    }),
})

export const createPageReportHandler = new Hono().post(
  "/:id/pages/:pageId/reports",
  describeRoute({
    summary: "Report a page",
    description:
      "Reports a problem with one page of a published chapter, so uploaders and moderators can fix it. You can have one open report per page.\n\n**Authentication:** signed-in user.",
    tags: ["Page reports"],
    responses: {
      201: {
        description: "Report created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the new report." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or it has no page with the given ID.",
        409: "You already have an open report on this page.",
        422: "One of the provided IDs is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(chapterReportAudit.CREATE, (c) => ({
    id: c.req.param("id"),
    pageId: c.req.param("pageId"),
  })),
  withAuth("pageReport.create"),
  rateLimit({ prefix: "page-report", windowMs: 60_000, limit: 10 }),
  validateParam(paramSchema),
  validateJson(bodySchema),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, user, chapter } = c.var
    const { pageId } = c.var.param
    const { reason, comment } = c.var.json

    if (!(chapter.pages ?? []).some((page) => page.id === pageId)) {
      return c.fail("PAGE_NOT_FOUND")
    }

    const report = await db
      .insertInto("pageReports")
      .values({
        reporterId: user.id,
        chapterId: chapter.id,
        pageId,
        reason,
        comment: comment ?? null,
      })
      .onConflict((oc) =>
        oc.columns(["reporterId", "chapterId", "pageId"]).where("status", "=", "OPEN").doNothing(),
      )
      .returning("id")
      .executeTakeFirst()

    if (report === undefined) {
      return c.fail("PAGE_REPORT_EXISTS")
    }

    return c.ok(report)
  },
)
