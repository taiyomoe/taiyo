import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema
const staffListItemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "Name of the staff.", example: "Kishimoto Masashi" }),
  image: z
    .string()
    .nullable()
    .meta({ description: "Storage key of the staff image, if any.", example: null }),
})

export const listStaffsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List staffs",
    description: "Lists staffs alphabetically by name.\n\n**Authentication:** none.",
    tags: ["Staffs"],
    responses: {
      200: {
        description: "Matching staffs.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(staffListItemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("staffs")
        .select(["id", "name", "image"])
        .where("deletedAt", "is", null)
        .orderBy("name", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("staffs")
        .select(sql<string>`count(*)`.as("count"))
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
