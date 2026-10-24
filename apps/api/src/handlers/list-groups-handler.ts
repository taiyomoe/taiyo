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
  owned: z.boolean().meta({ description: "Whether the group has an owner." }),
})
const querySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .meta({ description: "Only list groups whose name contains this text.", example: "akira" }),
})

export const listGroupsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List groups",
    description:
      "Lists groups alphabetically by name, optionally filtered by name.\n\n**Authentication:** none.",
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
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search } = c.var.query
    const base = db
      .selectFrom("groups")
      .where("deletedAt", "is", null)
      .where((eb) =>
        search === undefined
          ? eb.and([])
          : eb("name", "ilike", `%${search.replace(/[\\%_]/g, "\\$&")}%`),
      )
    const [items, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "id",
          "name",
          "logo",
          eb
            .exists(
              eb
                .selectFrom("groupMemberships")
                .select("groupMemberships.userId")
                .whereRef("groupMemberships.groupId", "=", "groups.id")
                .where("groupMemberships.role", "=", "OWNER"),
            )
            .as("owned"),
        ])
        .orderBy("name", "asc")
        .orderBy("id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      items.map((item) => ({ ...item, owned: Boolean(item.owned) })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
