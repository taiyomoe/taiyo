import { libraryAudit } from "@taiyomoe/audit"
import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ mediaId: z.uuid().meta({ description: "The ID of the media." }) })
const bodySchema = z.object({
  status: z.enum(USER_LIBRARY_STATUSES).meta({
    description: "The status of the media in your library.",
    example: "READING",
  }),
  notify: z.boolean().optional().meta({
    description:
      "Whether new chapters of the media notify you. When omitted, a new entry notifies and an existing entry keeps its choice. Entries in `DROPPED` or `COMPLETED` never notify.",
    example: true,
  }),
})

export const upsertLibraryEntryHandler = new Hono().put(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Add a media to my library",
    description:
      "Adds a media to your library with the given status, or changes its status when it is already there. Also turns notifications for new chapters of the media on or off.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Library entry saved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  userId: z.uuid().meta({ description: "Your ID." }),
                  mediaId: z.uuid().meta({ description: "The ID of the media." }),
                  status: z.enum(USER_LIBRARY_STATUSES).meta({
                    description: "The status of the media in your library.",
                    example: "READING",
                  }),
                  notify: z
                    .boolean()
                    .meta({ description: "Whether new chapters of the media notify you." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(libraryAudit.ENTRY_SET, (c) => ({ id: c.req.param("mediaId") })),
  withAuth(),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { mediaId } = c.var.param
    const { status, notify } = c.var.json

    c.var.audit.set({ target: { status, notify } })

    const media = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "=", mediaId)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!media) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const entry = await db
      .insertInto("userLibraryEntries")
      .values({ userId: user.id, mediaId, status, notify })
      .onConflict((oc) => oc.columns(["userId", "mediaId"]).doUpdateSet({ status, notify }))
      .returning(["userId", "mediaId", "status", "notify"])
      .executeTakeFirstOrThrow()

    return c.ok(entry)
  },
)
