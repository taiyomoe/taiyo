import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  chapterIdsSchema,
  lockReviewableChapters,
  skippedChapterSchema,
} from "../utils/chapter-batches"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const approveSchema = z.object({ chapterIds: chapterIdsSchema })

export const approveChaptersHandler = new Hono().post(
  "/approve",
  describeRoute({
    summary: "Approve submitted chapters in bulk",
    description:
      "Publishes several chapters waiting for review at once, as they are. Chapters that are not waiting for review or have no processed pages yet are skipped and reported.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    requestBody: {
      content: { "application/json": await resolver(approveSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "The approved chapters and the ones that were skipped.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ approved: z.uuid().array(), skipped: skippedChapterSchema.array() }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The request data failed validation." }),
    },
  }),
  withAuth("chapter.review"),
  validateJson(approveSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const chapters = await lockReviewableChapters(db, c.var.json.chapterIds)
    const approved: string[] = []
    const skipped: Array<z.infer<typeof skippedChapterSchema>> = []

    for (const { id, row } of chapters) {
      if (row === undefined) {
        skipped.push({ id, reason: "NOT_FOUND" })
      } else if (row.status !== "PENDING") {
        skipped.push({ id, reason: "NOT_PENDING" })
      } else if (row.pages === null || row.pages.length === 0) {
        skipped.push({ id, reason: "PAGES_MISSING" })
      } else {
        approved.push(id)
      }
    }

    if (approved.length > 0) {
      await db
        .updateTable("chapters")
        .set({
          status: "PUBLISHED",
          reviewerId: user.id,
          reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
          createdAt: sql<Date>`CURRENT_TIMESTAMP`,
        })
        .where("id", "in", approved)
        .execute()
    }

    return c.ok({ approved, skipped })
  },
)
