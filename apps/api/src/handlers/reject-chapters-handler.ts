import { chapterReviewAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
import { audited } from "../middlewares/audited-middleware"
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
    description: "Why the chapters were rejected, shown to their uploaders, up to 2000 characters.",
    example: "The pages are blurry. Please upload a cleaner scan.",
  }),
})

export const rejectChaptersHandler = new Hono().post(
  "/reject",
  describeRoute({
    summary: "Reject submitted chapters in bulk",
    description: `Rejects up to ${config.input.maxReviewBatch} chapters waiting for review at once with the same reason, and deletes their pages. Chapters that do not exist or are not waiting for review are skipped and reported.\n\n**Required roles:** uploader, admin.`,
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "The rejected and skipped chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  rejected: z
                    .uuid()
                    .array()
                    .meta({ description: "The IDs of the chapters that were rejected." }),
                  skipped: skippedChapterSchema
                    .array()
                    .meta({ description: "The chapters that were left alone, and why." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(chapterReviewAudit.REJECT_MANY),
  withAuth("chapter.review"),
  validateJson(rejectSchema),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, user } = c.var
    const chapters = await lockReviewableChapters(db, c.var.json.chapterIds)
    const rejected = chapters.flatMap(({ row }) => (row?.status === "PENDING" ? [row] : []))
    const skipped = chapters.flatMap(({ id, row }) =>
      row?.status === "PENDING"
        ? []
        : [
            { id, reason: row === undefined ? "NOT_FOUND" : "NOT_PENDING" } satisfies z.infer<
              typeof skippedChapterSchema
            >,
          ],
    )

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

    c.var.audit.set({
      reason: c.var.json.reason,
      changes: { after: { chapterIds: rejected.map((chapter) => chapter.id) } },
    })

    return c.ok({ rejected: rejected.map((chapter) => chapter.id), skipped })
  },
)
