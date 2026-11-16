import { commentAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const deleteCommentsSchema = z.object({
  commentIds: bulkIdsSchema("comments", [
    "0b7e9a52-3c1d-4f8e-a6b2-9d4c5e7f1a3b",
    "6f2d8c41-9a5e-4b7c-8e1f-3a6b9c2d5e7f",
  ]),
})
const skippedCommentSchema = skippedSchema(
  "comment",
  ["NOT_FOUND"],
  "Why the comment was left alone: it does not exist or was already removed.",
)

export const deleteCommentsHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete comments in bulk",
    description:
      "Deletes several comments at once, each as if deleted on its own: a top-level comment with visible replies stays as a placeholder saying who removed it. Deleting someone else's comment also resolves its open reports. Comments that do not exist or were already removed are skipped and reported.\n\n**Required roles:** moderator, admin.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "The deleted and skipped comments.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("comments", "deleted", skippedCommentSchema)),
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
  audited(commentAudit.DELETE_MANY),
  withAuth("comment.delete"),
  validateJson(deleteCommentsSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { commentIds } = c.var.json
    const rows = await db
      .selectFrom("comments")
      .select(["id", "authorId"])
      .where("id", "in", commentIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(commentIds, rows)
    const done = found.map((row) => row.id)
    const own = found.filter((row) => row.authorId === user.id).map((row) => row.id)
    const others = found.filter((row) => row.authorId !== user.id).map((row) => row.id)
    const markDeleted = async (ids: string[], deletion: "AUTHOR" | "MODERATOR") => {
      if (ids.length > 0) {
        await db
          .updateTable("comments")
          .set({ deletedAt: sql<Date>`CURRENT_TIMESTAMP`, deletion, deleterId: user.id })
          .where("id", "in", ids)
          .execute()
      }
    }

    await markDeleted(own, "AUTHOR")
    await markDeleted(others, "MODERATOR")

    if (others.length > 0) {
      await db
        .updateTable("commentReports")
        .set({ status: "RESOLVED", resolverId: user.id, resolvedAt: sql<Date>`CURRENT_TIMESTAMP` })
        .where("commentId", "in", others)
        .where("status", "=", "OPEN")
        .execute()
    }

    c.var.audit.set({ changes: { after: { commentIds: done } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
