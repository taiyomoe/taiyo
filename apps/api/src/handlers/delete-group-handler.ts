import { groupAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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
      "Deletes the group, which then no longer shows up in listings or by ID.\n\n**Required roles:** admin.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "Group deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the group." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupAudit.DELETE),
  withAuth("group.delete"),
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
