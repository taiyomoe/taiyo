import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { countNotifications } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const count = (description: string) => z.int().nonnegative().meta({ description })
const countsSchema = z.object({
  total: count("How many notifications you have."),
  unread: count("How many of them you haven't read."),
  categories: z
    .object({
      chapters: count("Unread new chapters."),
      replies: count("Unread replies to your comments."),
      activity: count("Unread upvotes and follows."),
    })
    .meta({ description: "The unread count of each kind." }),
})

export const getMyNotificationCountsHandler = new Hono().get(
  "/me/notifications/counts",
  describeRoute({
    summary: "Count my notifications",
    description:
      "Returns how many notifications you have, how many you haven't read, and the unread count of each kind.\n\n**Authentication:** signed-in user.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Your notification counts.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(countsSchema)) } },
      },
      ...getOpenApiResponses(),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var

    return c.ok(await countNotifications(db, user.id))
  },
)
