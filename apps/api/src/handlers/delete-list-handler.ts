import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { requireListOwner } from "../middlewares/require-list-owner-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteListHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a list",
    description:
      "Soft-deletes a list. The list can be restored later.\n\n**Authentication:** list owner.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "List deleted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "List"),
  checkList(),
  requireListOwner,
  withTransaction,
  async (c) => {
    const { db, list } = c.var

    await db
      .updateTable("userLists")
      .set({ deletedAt: new Date() })
      .where("id", "=", list.id)
      .execute()

    return c.ok({ id: list.id })
  },
)
