import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), mediaId: z.uuid() })

export const removeListItemHandler = new Hono().delete(
  "/:id/items/:mediaId",
  describeRoute({
    summary: "Remove a media from a list",
    description: "Removes one media from the list.\n\n**Authentication:** list owner.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "Item removed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ listId: z.uuid(), mediaId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given id exists, or no such item on the list.",
        422: "The provided path parameters failed validation.",
      }),
    },
  }),
  withAuth("update", "List"),
  validateParam(paramSchema),
  checkList(),
  requireListOwner,
  withTransaction,
  async (c) => {
    const { db, list } = c.var
    const { mediaId } = c.var.param
    const result = await db
      .deleteFrom("userListItems")
      .where("listId", "=", list.id)
      .where("mediaId", "=", mediaId)
      .executeTakeFirst()

    if (result.numDeletedRows === 0n) {
      return c.fail("LIST_ITEM_NOT_FOUND")
    }

    return c.ok({ listId: list.id, mediaId })
  },
)
