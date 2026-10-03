import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), mediaId: z.uuid() })
const bodySchema = z.object({
  position: z.int().nonnegative().meta({ description: "New position." }),
})

export const updateListItemHandler = new Hono().patch(
  "/:id/items/:mediaId",
  describeRoute({
    summary: "Reposition a media on a list",
    description:
      "Updates the position of a media on a list. Other items are not renumbered automatically; clients can produce gap-free ordering on the client side if they care.\n\n**Authentication:** list owner.",
    tags: ["Custom lists"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Item repositioned.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ listId: z.uuid(), mediaId: z.uuid(), position: z.int() }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given id exists, or no such item on the list.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "List"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  checkList(),
  requireListOwner,
  withTransaction,
  async (c) => {
    const { db, list } = c.var
    const { mediaId } = c.var.param
    const { position } = c.var.json
    const result = await db
      .updateTable("userListItems")
      .set({ position })
      .where("listId", "=", list.id)
      .where("mediaId", "=", mediaId)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return c.fail("LIST_ITEM_NOT_FOUND")
    }

    return c.ok({ listId: list.id, mediaId, position })
  },
)
