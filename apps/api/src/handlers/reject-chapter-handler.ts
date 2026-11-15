import { chapterReviewAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  reason: reviewNoteSchema.meta({
    description: "Why the chapter was rejected, shown to the uploader, up to 2000 characters.",
    example: "The pages are blurry. Please upload a cleaner scan.",
  }),
})

export const rejectChapterHandler = new Hono().post(
  "/:id/reject",
  describeRoute({
    summary: "Reject a submitted chapter",
    description:
      "Rejects a chapter waiting for review. The uploader sees the reason, the pages are deleted and the chapter stays listed as rejected. Submitting it again means uploading it again.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "Chapter rejected.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the chapter." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists.",
        409: "The chapter is not waiting for review.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(chapterReviewAudit.REJECT),
  withAuth("chapter.review"),
  validateJson(rejectSchema),
  checkChapter({ unpublished: true }),
  withTransaction,
  async (c) => {
    const { chapter, db, s3, s3Bucket, user } = c.var

    c.var.audit.set({ target: { mediaId: chapter.mediaId }, reason: c.var.json.reason })

    const locked = await db
      .selectFrom("chapters")
      .select(["id", "mediaId", "status", "pages"])
      .where("id", "=", chapter.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (locked.status !== "PENDING") {
      return c.fail("CHAPTER_NOT_PENDING")
    }

    await db
      .updateTable("chapters")
      .set({
        status: "REJECTED",
        rejectionReason: c.var.json.reason,
        reviewerId: user.id,
        reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
        pages: null,
      })
      .where("id", "=", chapter.id)
      .execute()

    c.var.afterCommit(() => deleteChapterPages({ s3, s3Bucket }, locked))

    return c.ok({ id: chapter.id })
  },
)
