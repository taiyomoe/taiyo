import { listAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeList } from "../middlewares/authorize-list-middleware"
import { checkList } from "../middlewares/check-list-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { notifyModeration } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteListHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a list",
    description:
      "Deletes a list. Moderators and admins can also delete the `PUBLIC` lists of other users, and the owner is then notified.\n\n**Required access:** the owner of the list, or a moderator or admin.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "List deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the list." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are neither the owner of the list nor a moderator or admin, or the list is someone else's `PRIVATE` list.",
        404: "No list with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(listAudit.DELETE),
  withAuth(),
  checkList(),
  authorizeList("delete"),
  withTransaction,
  async (c) => {
    const { db, list } = c.var

    await db
      .updateTable("userLists")
      .set({ deletedAt: new Date() })
      .where("id", "=", list.id)
      .execute()

    await notifyModeration(c.var, [
      {
        type: "LIST_MODERATED",
        userId: list.userId,
        payload: { listId: list.id, action: "DELETED" },
      },
    ])

    return c.ok({ id: list.id })
  },
)
