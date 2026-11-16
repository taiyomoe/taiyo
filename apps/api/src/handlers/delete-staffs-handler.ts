import { staffAudit } from "@taiyomoe/audit"
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

const deleteStaffsSchema = z.object({
  staffIds: bulkIdsSchema("staffs", [
    "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2",
    "b1e4f7a2-6c3d-4e9f-8a5b-2d7c1e9f4a6b",
  ]),
})
const skippedStaffSchema = skippedSchema(
  "staff",
  ["NOT_FOUND"],
  "Why the staff was left alone: it does not exist or is deleted.",
)

export const deleteStaffsHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete staffs in bulk",
    description:
      "Deletes several staffs at once. They no longer appear in staff listings or on the medias they were linked to. Staffs that do not exist are skipped and reported.\n\n**Required roles:** uploader, admin.",
    tags: ["Staffs"],
    responses: {
      200: {
        description: "The deleted and skipped staffs.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("staffs", "deleted", skippedStaffSchema)),
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
  audited(staffAudit.DELETE_MANY),
  withAuth("staff.delete"),
  validateJson(deleteStaffsSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { staffIds } = c.var.json
    const rows = await db
      .selectFrom("staffs")
      .select("id")
      .where("id", "in", staffIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(staffIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db
        .updateTable("staffs")
        .set({ deletedAt: new Date(), deleterId: user.id })
        .where("id", "in", done)
        .execute()
    }

    c.var.audit.set({ changes: { after: { staffIds: done } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
