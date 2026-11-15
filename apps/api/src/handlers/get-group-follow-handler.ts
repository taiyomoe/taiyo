import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getGroupFollow, groupFollowSchema } from "../utils/group-follows"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getGroupFollowHandler = new Hono().get(
  "/:id/follow",
  describeRoute({
    summary: "Get my follow state for a group",
    description:
      "Returns whether you follow the group, with its follower count.\n\n**Authentication:** signed-in user.",
    tags: ["Group follows"],
    responses: {
      200: {
        description: "Your follow state.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupFollowSchema)) },
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
  withAuth(),
  checkGroup(),
  async (c) => c.ok(await getGroupFollow(c.var.db, c.var.group.id, c.var.user.id)),
)
