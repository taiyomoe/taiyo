import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { isUniqueViolation } from "../utils/pg-errors"
import { apiSuccessEnvelope } from "../utils/schemas"

const addItemSchema = z.object({
  mediaId: z.uuid().meta({ description: "ID of an existing media to add." }),
  position: z
    .int()
    .nonnegative()
    .optional()
    .meta({ description: "Insert position. Default: end of the list." }),
})

export const addListItemHandler = new Hono().post(
  "/:id/items",
  describeRoute({
    summary: "Add a media to a list",
    description:
      "Adds a media to a list. If `position` is omitted, the media goes to the end.\n\n**Authentication:** list owner.",
    tags: ["Custom lists"],
    requestBody: {
      content: { "application/json": await resolver(addItemSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Item added.",
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
        404: "No list or media with the given id exists.",
        409: "This media is already on the list.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "List"),
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

    let finalPosition = position

    if (finalPosition === undefined) {
      const last = await db
        .selectFrom("userListItems")
        .select((eb) => eb.fn.max<number>("position").as("max"))
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

    return c.ok({ listId: list.id, mediaId, position: finalPosition })
  },
)
