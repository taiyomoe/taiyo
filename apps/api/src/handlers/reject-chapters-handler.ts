import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  chapterIdsSchema,
  lockReviewableChapters,
  skippedChapterSchema,
} from "../utils/chapter-batches"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  chapterIds: chapterIdsSchema,
  reason: reviewNoteSchema.meta({
    description: "Why the chapters were rejected, for the uploader.",
  }),
})

export const rejectChaptersHandler = new Hono().post(
  "/reject",
  describeRoute({
    summary: "Reject submitted chapters in bulk",
    description:
      "Rejects several chapters waiting for review at once with the same reason, and deletes their pages. Chapters that are not waiting for review are skipped and reported.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    requestBody: {
      content: { "application/json": await resolver(rejectSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "The rejected chapters and the ones that were skipped.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ rejected: z.uuid().array(), skipped: skippedChapterSchema.array() }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The request data failed validation." }),
    },
  }),
  withAuth("chapter.review"),
  validateJson(rejectSchema),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, user } = c.var
    const chapters = await lockReviewableChapters(db, c.var.json.chapterIds)
    const rejected = chapters.flatMap(({ row }) => (row?.status === "PENDING" ? [row] : []))
    const skipped = chapters.flatMap(({ id, row }): Array<z.infer<typeof skippedChapterSchema>> => {
      if (row === undefined) {
        return [{ id, reason: "NOT_FOUND" }]
      }

      return row.status === "PENDING" ? [] : [{ id, reason: "NOT_PENDING" }]
    })

    if (rejected.length > 0) {
      await db
        .updateTable("chapters")
        .set({
          status: "REJECTED",
          rejectionReason: c.var.json.reason,
          reviewerId: user.id,
          reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
          pages: null,
        })
        .where(
          "id",
          "in",
          rejected.map((chapter) => chapter.id),
        )
        .execute()

      c.var.afterCommit(async () => {
        for (const chapter of rejected) {
          await deleteChapterPages({ s3, s3Bucket }, chapter)
        }
      })
    }

    return c.ok({ rejected: rejected.map((chapter) => chapter.id), skipped })
  },
)
