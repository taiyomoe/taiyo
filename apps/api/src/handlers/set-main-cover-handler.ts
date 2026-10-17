import { coverAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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
      "Makes the given cover the main cover for its media, replacing any previous main cover.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
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
  audited(coverAudit.SET_MAIN),
  withAuth("media.update"),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover } = c.var

    c.var.audit.set({ target: { mediaId: cover.mediaId } })

    await db
      .updateTable("covers")
      .set({ isMainCover: false })
      .where("mediaId", "=", cover.mediaId)
      .where("id", "!=", cover.id)
      .where("isMainCover", "=", true)
      .execute()

    await db.updateTable("covers").set({ isMainCover: true }).where("id", "=", cover.id).execute()

    return c.ok({ id: cover.id })
  },
)
