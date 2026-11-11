import { groupAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getGroupFollow, groupFollowSchema } from "../utils/group-follows"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const unfollowGroupHandler = new Hono().delete(
  "/:id/follow",
  describeRoute({
    summary: "Unfollow a group",
    description:
      "Stops following the group. Unfollowing a group you don't follow does nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Group follows"],
    responses: {
      200: {
        description: "You no longer follow the group.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupFollowSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  audited(groupAudit.UNFOLLOW),
  withAuth(),
  checkGroup(),
  async (c) => {
    const { db, group, user } = c.var

    await db
      .deleteFrom("groupFollows")
      .where("userId", "=", user.id)
      .where("groupId", "=", group.id)
      .execute()

    return c.ok(await getGroupFollow(db, group.id, user.id))
  },
)
