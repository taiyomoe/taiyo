import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const groupListItemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "Name of the group.", example: "scansPROJECT" }),
  logo: z.string().nullable().meta({ description: "Storage key of the group logo, if any." }),
})

export const listGroupsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List groups",
    description: "Lists groups alphabetically by name.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "Matching groups.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(groupListItemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("groups")
        .select(["id", "name", "logo"])
        .where("deletedAt", "is", null)
        .orderBy("name", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("groups")
        .select(sql<string>`count(*)`.as("count"))
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
