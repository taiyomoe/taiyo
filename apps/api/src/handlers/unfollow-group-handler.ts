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
      "Unfollows the group. Unfollowing a group you do not follow does nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Group follows"],
    responses: {
      200: {
        description: "Group unfollowed.",
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
