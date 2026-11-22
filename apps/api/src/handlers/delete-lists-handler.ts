import { listAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { notifyModeration } from "../utils/notifications/moderation"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const deleteListsSchema = z.object({
  listIds: bulkIdsSchema("lists", [
    "5b1e8c3a-7d2f-4e9b-a6c4-1f3d8e2a9b7c",
    "e4a7c2d9-1b6f-4a3e-8c5d-9f2b7e1a4c6d",
  ]),
})
const skippedListSchema = skippedSchema(
  "list",
  ["NOT_FOUND", "FORBIDDEN"],
  "Why the list was left alone: it does not exist, or you cannot delete it.",
)

export const deleteListsHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete lists in bulk",
    description:
      "Deletes several lists at once. Lists that do not exist or that you cannot delete are skipped and reported. The owner of each deleted list that is not yours is notified.\n\n**Required access:** for each list, its owner, or a moderator or admin when the list is `PUBLIC`.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "The deleted and skipped lists.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("lists", "deleted", skippedListSchema)),
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
  audited(listAudit.DELETE_MANY),
  withAuth(),
  validateJson(deleteListsSchema),
  withTransaction,
  async (c) => {
    const { can, db } = c.var
    const { listIds } = c.var.json
    const rows = await db
      .selectFrom("userLists")
      .select(["id", "userId", "visibility"])
      .where("id", "in", listIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(listIds, rows)
    const deleted = found.filter((row) => can("list.delete", row))
    const done = deleted.map((row) => row.id)

    if (done.length > 0) {
      await db
        .updateTable("userLists")
        .set({ deletedAt: new Date() })
        .where("id", "in", done)
        .execute()
    }

    await notifyModeration(
      c.var,
      deleted.map((row) => ({
        type: "LIST_MODERATED",
        userId: row.userId,
        payload: { listId: row.id, action: "DELETED" },
      })),
    )

    c.var.audit.set({ changes: { after: { listIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...found
          .filter((row) => !can("list.delete", row))
          .map((row) => ({ id: row.id, reason: "FORBIDDEN" as const })),
      ],
    })
  },
)
