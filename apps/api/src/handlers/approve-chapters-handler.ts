import { chapterReviewAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  chapterIdsSchema,
  lockReviewableChapters,
  skippedChapterSchema,
} from "../utils/chapter-batches"
import { readyCreatedAt, readyStatus } from "../utils/chapter-release"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const approveSchema = z.object({ chapterIds: chapterIdsSchema })

export const approveChaptersHandler = new Hono().post(
  "/approve",
  describeRoute({
    summary: "Approve submitted chapters in bulk",
    description: `Approves up to ${config.input.maxReviewBatch} chapters waiting for review at once, as they are. Each one is released right away, or at its \`publishAt\` time if that is still ahead. Chapters that do not exist, are not waiting for review, have no processed pages yet or belong to a locked media are skipped and reported.\n\n**Required roles:** uploader, admin.`,
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "The approved and skipped chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  approved: z
                    .uuid()
                    .array()
                    .meta({ description: "The IDs of the chapters that were approved." }),
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
  audited(chapterReviewAudit.APPROVE_MANY),
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
      } else if (!row.isExternal && (row.pages === null || row.pages.length === 0)) {
        skipped.push({ id, reason: "PAGES_MISSING" })
      } else if (row.mediaFlag === "LOCKED") {
        skipped.push({ id, reason: "MEDIA_LOCKED" })
      } else {
        approved.push(id)
      }
    }

    if (approved.length > 0) {
      await db
        .updateTable("chapters")
        .set({
          status: readyStatus,
          reviewerId: user.id,
          reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
          createdAt: readyCreatedAt,
        })
        .where("id", "in", approved)
        .execute()
    }

    c.var.audit.set({ changes: { after: { chapterIds: approved } } })

    return c.ok({ approved, skipped })
  },
)
