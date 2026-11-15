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

export const deleteCoverHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a cover",
    description:
      "Deletes a cover. The main cover of a media cannot be deleted: set another cover as main first.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "Cover deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted cover." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No cover with the given ID exists.",
        409: "The cover is the main cover of its media.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(coverAudit.DELETE),
  withAuth("media.update"),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover, user } = c.var

    c.var.audit.set({ target: { mediaId: cover.mediaId } })

    if (cover.isMainCover) {
      return c.fail("COVER_IS_MAIN")
    }

    await db
      .updateTable("covers")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", cover.id)
      .execute()

    return c.ok({ id: cover.id })
  },
)
