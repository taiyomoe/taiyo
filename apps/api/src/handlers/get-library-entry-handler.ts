import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ mediaId: z.uuid() })
const libraryEntrySchema = z.object({
  mediaId: z.uuid(),
  status: z.enum(USER_LIBRARY_STATUSES),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const getLibraryEntryHandler = new Hono().get(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Get my library entry for a media",
    description:
      "Returns your library entry for the media, or null when the media is not in your library.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your library entry, or null.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(libraryEntrySchema.nullable())),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  validateParam(paramSchema),
  async (c) => {
    const { db, user } = c.var
    const { mediaId } = c.var.param
    const entry = await db
      .selectFrom("userLibraryEntries")
      .select(["mediaId", "status", "createdAt", "updatedAt"])
      .where("userId", "=", user.id)
      .where("mediaId", "=", mediaId)
      .executeTakeFirst()

    return c.ok(entry ?? null)
  },
)
