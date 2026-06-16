import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const setMainCoverHandler = new Hono().post(
  "/:id/set-main",
  describeRoute({
    summary: "Set the main cover",
    description:
      "Makes the given cover the main cover for its media, replacing any previous main cover.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "Main cover updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new main cover." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No cover with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("update", "Media"),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover } = c.var

    // Unset any other current main cover first, then promote this one. The
    // unique partial index on covers(mediaId) WHERE isMainCover guarantees
    // the invariant; doing the unset before the set keeps the transaction
    // from violating it mid-flight under concurrent calls.
    await db
      .updateTable("covers")
      .set({ isMainCover: false })
      .where("mediaId", "=", cover.mediaId)
      .where("id", "!=", cover.id)
      .where("isMainCover", "=", true)
      .execute()

    await db.updateTable("covers").set({ isMainCover: true }).where("id", "=", cover.id).execute()

    c.var.afterCommit(() =>
      syncMedia(
        { db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex },
        cover.mediaId,
      ),
    )

    return c.ok({ id: cover.id })
  },
)
