import { listAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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
    description: "Deletes one of your lists.\n\n**Required access:** the owner of the list.",
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
        403: "You are not the owner of the list, or you do not have permission to perform this action.",
        404: "No list with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(listAudit.DELETE),
  withAuth(),
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
