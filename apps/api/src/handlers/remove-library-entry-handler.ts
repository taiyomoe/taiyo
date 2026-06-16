import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ mediaId: z.uuid() })

export const removeLibraryEntryHandler = new Hono().delete(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Remove a media from my library",
    description:
      "Removes the entry. The media itself is untouched.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Library entry removed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ mediaId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "You don't have a library entry for this media.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "Library"),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { mediaId } = c.var.param
    const result = await db
      .deleteFrom("userLibraryEntries")
      .where("userId", "=", user.id)
      .where("mediaId", "=", mediaId)
      .executeTakeFirst()

    if (result.numDeletedRows === 0n) {
      return c.fail("LIBRARY_ENTRY_NOT_FOUND")
    }

    return c.ok({ mediaId })
  },
)
