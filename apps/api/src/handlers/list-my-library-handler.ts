import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z.enum(USER_LIBRARY_STATUSES).optional().meta({
    description: "Filter by bucket. Default: all buckets.",
  }),
})
const libraryItemSchema = z.object({
  mediaId: z.uuid(),
  status: z.enum(USER_LIBRARY_STATUSES),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listMyLibraryHandler = new Hono().get(
  "/me/library",
  describeRoute({
    summary: "List my library",
    description:
      "Returns your library entries, most-recently-updated first. Filter by `status` to scope to one bucket.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your library entries.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(libraryItemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("read", "Library"),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage, status } = c.var.query
    let base = db.selectFrom("userLibraryEntries").where("userId", "=", user.id)

    if (status) {
      base = base.where("status", "=", status)
    }

    const [items, totalRow] = await Promise.all([
      base
        .select(["mediaId", "status", "createdAt", "updatedAt"])
        .orderBy("updatedAt", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(db.fn.countAll<number>().as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
