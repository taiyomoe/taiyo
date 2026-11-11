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

const paramSchema = z.object({ mediaId: z.uuid() })
const bodySchema = z.object({
  status: z.enum(USER_LIBRARY_STATUSES).meta({
    description: "Which bucket to put the media in.",
    example: "READING",
  }),
  notify: z.boolean().optional().meta({
    description:
      "Whether new chapters of the media notify you. Left out, a new entry notifies and an existing entry keeps its choice. Entries in DROPPED or COMPLETED never notify.",
    example: true,
  }),
})

export const upsertLibraryEntryHandler = new Hono().put(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Add or move a media in my library",
    description:
      "Upserts a library entry. Adds the media to the chosen bucket; if it was already in another bucket, moves it. Also turns new-chapter notifications on or off for the media. Idempotent.\n\n**Authentication:** signed-in user.",
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
                  notify: z.boolean(),
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
