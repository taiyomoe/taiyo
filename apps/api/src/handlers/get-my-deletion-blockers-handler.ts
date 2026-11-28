import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { withAuth } from "../middlewares/with-auth-middleware"
import { deletionBlockersSchema, getDeletionBlockers } from "../utils/account-deletion"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getMyDeletionBlockersHandler = new Hono().get(
  "/me/deletion-blockers",
  describeRoute({
    summary: "Get what keeps my account from being deleted",
    description:
      "Lists what you must settle before you can delete your account: the groups you own, and whether you are the only admin. When both are empty, you can ask to delete it through `POST /api/auth/delete-user`.\n\n**Authentication:** signed-in user.",
    tags: ["Your data"],
    responses: {
      200: {
        description: "What keeps your account from being deleted.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(deletionBlockersSchema)) },
        },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => c.ok(await getDeletionBlockers(c.var.db, c.var.user.id)),
)
