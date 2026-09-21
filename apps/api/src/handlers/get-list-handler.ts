import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const listDetailSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  visibility: z.enum(USER_LIST_VISIBILITIES),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  items: z
    .object({
      mediaId: z.uuid(),
      position: z.int(),
      addedAt: z.iso.datetime(),
    })
    .array(),
})

export const getListHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a list",
    description:
      "Returns a list with its items in position order. PRIVATE lists are only visible to their owner.\n\n**Authentication:** none for PUBLIC lists; owner-only for PRIVATE.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "List details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(listDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given id exists or you cannot see it.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkList(),
  async (c) => {
    const { db, list } = c.var

    if (list.visibility === "PRIVATE") {
      const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers })

      if (!session || session.user.id !== list.userId) {
        return c.fail("LIST_NOT_FOUND")
      }
    }

    const items = await db
      .selectFrom("userListItems")
      .select(["mediaId", "position", "addedAt"])
      .where("listId", "=", list.id)
      .orderBy("position", "asc")
      .orderBy("addedAt", "asc")
      .execute()

    return c.ok({
      id: list.id,
      userId: list.userId,
      name: list.name,
      description: list.description,
      visibility: list.visibility,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      items,
    })
  },
)
