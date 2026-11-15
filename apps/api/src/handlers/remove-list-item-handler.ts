import { listAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { touchList } from "../utils/user-lists"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the list." }),
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
})

export const removeListItemHandler = new Hono().delete(
  "/:id/items/:mediaId",
  describeRoute({
    summary: "Remove a media from a list",
    description:
      "Removes a media from one of your lists. The other titles keep their positions.\n\n**Required access:** the owner of the list.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "Media removed from the list.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  listId: z.uuid().meta({ description: "The ID of the list." }),
                  mediaId: z.uuid().meta({ description: "The ID of the media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not the owner of the list, or you do not have permission to perform this action.",
        404: "No list with the given ID exists, or the media is not on the list.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(listAudit.ITEM_REMOVE, (c) => ({
    id: c.req.param("id"),
    mediaId: c.req.param("mediaId"),
  })),
  withAuth(),
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

    await touchList(db, list.id)

    return c.ok({ listId: list.id, mediaId })
  },
)
