import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const itemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  visibility: z.enum(USER_LIST_VISIBILITIES),
  itemCount: z.int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listMyListsHandler = new Hono().get(
  "/me/lists",
  describeRoute({
    summary: "List my lists",
    description:
      "Returns your custom lists, most-recently-updated first.\n\n**Authentication:** signed-in user.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "Your custom lists.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("read", "List"),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("userLists")
        .where("userId", "=", user.id)
        .where("deletedAt", "is", null)
        .select((eb) => [
          "id",
          "name",
          "description",
          "visibility",
          "createdAt",
          "updatedAt",
          eb
            .selectFrom("userListItems")
            .whereRef("userListItems.listId", "=", "userLists.id")
            .select(eb.fn.countAll<number>().as("count"))
            .as("itemCount"),
        ])
        .orderBy("updatedAt", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userLists")
        .where("userId", "=", user.id)
        .where("deletedAt", "is", null)
        .select(db.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(
      items.map((item) => ({ ...item, itemCount: Number(item.itemCount) })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
