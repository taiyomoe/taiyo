import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { countLibraryEntries } from "../utils/library"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const countsSchema = z.object({
  total: z
    .int()
    .nonnegative()
    .meta({ description: "The number of media in your library.", example: 74 }),
  byStatus: z
    .record(z.enum(USER_LIBRARY_STATUSES), z.int().nonnegative())
    .meta({ description: "The number of media in your library per reading status." }),
})

export const getMyLibraryCountsHandler = new Hono().get(
  "/me/library/counts",
  describeRoute({
    summary: "Get my library counts",
    description:
      "Returns the number of media in your library, in total and per reading status.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your library counts.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(countsSchema)) } },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var

    return c.ok(await countLibraryEntries(db, user.id))
  },
)
