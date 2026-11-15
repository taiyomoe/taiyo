import { libraryAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ mediaId: z.uuid().meta({ description: "The ID of the media." }) })

export const removeLibraryEntryHandler = new Hono().delete(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Remove a media from my library",
    description:
      "Removes a media from your library. The media itself is not affected.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Library entry removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  mediaId: z.uuid().meta({ description: "The ID of the removed media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "The media is not in your library.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(libraryAudit.ENTRY_REMOVE, (c) => ({ id: c.req.param("mediaId") })),
  withAuth(),
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
