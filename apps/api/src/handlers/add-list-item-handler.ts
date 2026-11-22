import { listAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { isUniqueViolation } from "../utils/database-errors"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { countListItems, touchList } from "../utils/user-lists"

const addItemSchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media to add." }),
  position: z.int().nonnegative().optional().meta({
    description: "The position of the media on the list. Defaults to the end of the list.",
    example: 3,
  }),
})

export const addListItemHandler = new Hono().post(
  "/:id/items",
  describeRoute({
    summary: "Add a media to a list",
    description: `Adds a media to one of your lists, at the end unless you give a \`position\`. The other titles keep their positions. A list holds at most ${config.lists.maxItems} titles.\n\n**Required access:** the owner of the list.`,
    tags: ["Custom lists"],
    responses: {
      201: {
        description: "Media added to the list.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  listId: z.uuid().meta({ description: "The ID of the list." }),
                  mediaId: z.uuid().meta({ description: "The ID of the media." }),
                  position: z
                    .int()
                    .meta({ description: "The position of the media on the list.", example: 3 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not the owner of the list, or you do not have permission to perform this action.",
        404: "No list with the given ID exists, or the media does not exist.",
        409: "The media is already on the list, or the list is full.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(listAudit.ITEM_ADD),
  withAuth(),
  validateJson(addItemSchema),
  checkList(),
  requireListOwner,
  withTransaction,
  async (c) => {
    const { db, list } = c.var
    const { mediaId, position } = c.var.json
    const media = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "=", mediaId)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!media) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    if ((await countListItems(db, list.id)) >= config.lists.maxItems) {
      return c.fail("LIST_FULL")
    }

    let finalPosition = position

    if (finalPosition === undefined) {
      const last = await db
        .selectFrom("userListItems")
        .select((eb) => eb.fn.max<number | null>("position").as("max"))
        .where("listId", "=", list.id)
        .executeTakeFirst()

      finalPosition = last?.max === null || last?.max === undefined ? 0 : last.max + 1
    }

    try {
      await db
        .insertInto("userListItems")
        .values({ listId: list.id, mediaId, position: finalPosition })
        .execute()
    } catch (err) {
      if (isUniqueViolation(err, "userListItems_pkey")) {
        return c.fail("LIST_ITEM_EXISTS")
      }

      throw err
    }

    await touchList(db, list.id)

    c.var.audit.set({ target: { mediaId, position: finalPosition } })

    return c.ok({ listId: list.id, mediaId, position: finalPosition })
  },
)
