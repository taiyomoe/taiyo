import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ mediaId: z.uuid() })
const bodySchema = z.object({
  status: z.enum(USER_LIBRARY_STATUSES).meta({
    description: "Which bucket to put the media in.",
    example: "READING",
  }),
})

export const upsertLibraryEntryHandler = new Hono().put(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Add or move a media in my library",
    description:
      "Upserts a library entry. Adds the media to the chosen bucket; if it was already in another bucket, moves it. Idempotent.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Library entry upserted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  userId: z.uuid(),
                  mediaId: z.uuid(),
                  status: z.enum(USER_LIBRARY_STATUSES),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("create", "Library"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { mediaId } = c.var.param
    const { status } = c.var.json
    const media = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "=", mediaId)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!media) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    await db
      .insertInto("userLibraryEntries")
      .values({ userId: user.id, mediaId, status })
      .onConflict((oc) => oc.columns(["userId", "mediaId"]).doUpdateSet({ status }))
      .execute()

    return c.ok({ userId: user.id, mediaId, status })
  },
)
