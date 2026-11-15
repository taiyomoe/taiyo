import { listAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
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
const bodySchema = z.object({
  position: z
    .int()
    .nonnegative()
    .meta({ description: "The new position of the media on the list.", example: 2 }),
})

export const updateListItemHandler = new Hono().patch(
  "/:id/items/:mediaId",
  describeRoute({
    summary: "Move a media on a list",
    description:
      "Moves a media to a new position on one of your lists. The other titles keep their positions: they are not renumbered.\n\n**Required access:** the owner of the list.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "Media moved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  listId: z.uuid().meta({ description: "The ID of the list." }),
                  mediaId: z.uuid().meta({ description: "The ID of the media." }),
                  position: z.int().meta({
                    description: "The new position of the media on the list.",
                    example: 2,
                  }),
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
        422: "One of the provided IDs is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(listAudit.ITEM_MOVE, (c) => ({
    id: c.req.param("id"),
    mediaId: c.req.param("mediaId"),
  })),
  withAuth(),
  validateParam(paramSchema),
  validateJson(bodySchema),
  checkList(),
  requireListOwner,
  withTransaction,
  async (c) => {
    const { db, list } = c.var
    const { mediaId } = c.var.param
    const { position } = c.var.json

    c.var.audit.set({ target: { position } })

    const result = await db
      .updateTable("userListItems")
      .set({ position })
      .where("listId", "=", list.id)
      .where("mediaId", "=", mediaId)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return c.fail("LIST_ITEM_NOT_FOUND")
    }

    await touchList(db, list.id)

    return c.ok({ listId: list.id, mediaId, position })
  },
)
