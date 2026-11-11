import { groupAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getGroupFollow, groupFollowSchema } from "../utils/group-follows"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const followGroupHandler = new Hono().post(
  "/:id/follow",
  describeRoute({
    summary: "Follow a group",
    description:
      "Follows the group. Following a group you already follow does nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Group follows"],
    responses: {
      200: {
        description: "You follow the group.",
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
  audited(groupAudit.FOLLOW),
  withAuth(),
  checkGroup(),
  async (c) => {
    const { db, group, user } = c.var

    await db
      .insertInto("groupFollows")
      .values({ userId: user.id, groupId: group.id })
      .onConflict((oc) => oc.doNothing())
      .execute()

    return c.ok(await getGroupFollow(db, group.id, user.id))
  },
)
