import { adminAudit } from "@taiyomoe/audit"
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

const MAX_POINTS_AMOUNT = 1_000_000
const addUsersPointsSchema = z.object({
  userIds: bulkIdsSchema("users", [
    "0d3c5b9e-7f1a-4c2e-9b8d-6a5f4e3d2c1b",
    "a7e2f9c4-1b3d-4e5f-8a6b-9c0d1e2f3a4b",
  ]),
  amount: z
    .int()
    .min(-MAX_POINTS_AMOUNT)
    .max(MAX_POINTS_AMOUNT)
    .refine((amount) => amount !== 0, { message: "The amount cannot be 0." })
    .meta({
      description: `The number of points to add to each user, between -${MAX_POINTS_AMOUNT} and ${MAX_POINTS_AMOUNT}. A negative number removes points, and a balance never drops below 0.`,
      example: 500,
    }),
})
const skippedUserSchema = skippedSchema(
  "user",
  ["NOT_FOUND"],
  "Why the user was left alone: it does not exist.",
)

export const addUsersPointsHandler = new Hono().post(
  "/points",
  describeRoute({
    summary: "Add points to users in bulk",
    description:
      "Adds the same number of points to the balance of several users at once. A negative `amount` removes points, and a balance never drops below 0. Users that do not exist are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Users"],
    responses: {
      201: {
        description: "The updated and skipped users.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("users", "updated", skippedUserSchema)),
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
  audited(adminAudit.POINTS_GRANT_MANY),
  withAuth("user.grant"),
  validateJson(addUsersPointsSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { userIds, amount } = c.var.json
    const rows = await db
      .selectFrom("users")
      .select("id")
      .where("id", "in", userIds)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(userIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db
        .insertInto("userProfiles")
        .values(done.map((userId) => ({ userId, points: Math.max(amount, 0) })))
        .onConflict((oc) =>
          oc.column("userId").doUpdateSet({
            points: sql<number>`greatest("userProfiles"."points" + ${amount}, 0)`,
          }),
        )
        .execute()
    }

    c.var.audit.set({ changes: { after: { userIds: done, amount } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
