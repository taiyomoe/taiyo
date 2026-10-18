import { sql } from "@taiyomoe/db"
import { getStaffImageUrl } from "@taiyomoe/s3"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .meta({ description: "Only list staffs whose name contains this text." }),
})
const staffListItemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "Name of the staff.", example: "Kishimoto Masashi" }),
  imageUrl: z
    .url()
    .nullable()
    .meta({ description: "Public URL of the staff image, if any.", example: null }),
})

export const listStaffsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List staffs",
    description:
      "Lists staffs alphabetically by name, optionally filtered by name.\n\n**Authentication:** none.",
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
    const { page, perPage, search } = c.var.query
    const base = db
      .selectFrom("staffs")
      .where("deletedAt", "is", null)
      .where((eb) =>
        search === undefined
          ? eb.and([])
          : eb("name", "ilike", `%${search.replace(/[\\%_]/g, "\\$&")}%`),
      )
    const [items, totalRow] = await Promise.all([
      base
        .select(["id", "name", "image"])
        .orderBy("name", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      items.map(({ image, ...staff }) => ({
        ...staff,
        imageUrl: image === null ? null : getStaffImageUrl(image),
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
