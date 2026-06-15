import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteGroupHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a group",
    description:
      "Removes a group. The group can be restored later.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "Group deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted group." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "Group"),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var

    await db
      .updateTable("groups")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", group.id)
      .execute()

    return c.ok({ id: group.id })
  },
)
