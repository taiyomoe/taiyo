import { groupAudit } from "@taiyomoe/audit"
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

const deleteGroupsSchema = z.object({
  groupIds: bulkIdsSchema("groups", [
    "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1",
    "9c3e7b15-2f4a-4d8e-b6c1-5a7d9e2f3b4c",
  ]),
})
const skippedGroupSchema = skippedSchema(
  "group",
  ["NOT_FOUND"],
  "Why the group was left alone: it does not exist or is deleted.",
)

export const deleteGroupsHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete groups in bulk",
    description:
      "Deletes several groups at once, which then no longer show up in listings or by ID. Groups that do not exist are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The deleted and skipped groups.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("groups", "deleted", skippedGroupSchema)),
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
  audited(groupAudit.DELETE_MANY),
  withAuth("group.delete"),
  validateJson(deleteGroupsSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { groupIds } = c.var.json
    const rows = await db
      .selectFrom("groups")
      .select("id")
      .where("id", "in", groupIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(groupIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db
        .updateTable("groups")
        .set({ deletedAt: new Date(), deleterId: user.id })
        .where("id", "in", done)
        .execute()
    }

    c.var.audit.set({ changes: { after: { groupIds: done } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
