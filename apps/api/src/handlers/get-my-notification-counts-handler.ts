import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { countNotifications } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const count = (description: string, example: number) =>
  z.int().nonnegative().meta({ description, example })
const countsSchema = z.object({
  total: count("The number of notifications you have.", 42),
  unread: count("The number of notifications you have not read.", 7),
  categories: z
    .object({
      chapters: count("The number of unread notifications about new chapters.", 4),
      replies: count("The number of unread replies to your comments.", 2),
      activity: count("The number of unread upvotes and follows.", 1),
      rewards: count("The number of unread ranking rewards and achievements.", 1),
      moderation: count(
        "The number of unread notifications about what the moderation team did to your lists, your profile and your reports.",
        1,
      ),
    })
    .meta({ description: "The number of unread notifications of each kind." }),
})

export const getMyNotificationCountsHandler = new Hono().get(
  "/me/notifications/counts",
  describeRoute({
    summary: "Get my notification counts",
    description:
      "Returns the number of notifications you have, how many of them you have not read, and the number of unread notifications of each kind.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Your notification counts.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(countsSchema)) } },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var

    return c.ok(await countNotifications(db, user.id))
  },
)
