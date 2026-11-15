import { bannerAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkBanner } from "../middlewares/check-banner-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteBannerHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a banner",
    description:
      "Deletes a banner.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Banners"],
    responses: {
      200: {
        description: "Banner deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted banner." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No banner with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(bannerAudit.DELETE),
  withAuth("media.update"),
  checkBanner(),
  withTransaction,
  async (c) => {
    const { db, banner, user } = c.var

    c.var.audit.set({ target: { mediaId: banner.mediaId } })

    await db
      .updateTable("banners")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", banner.id)
      .execute()

    return c.ok({ id: banner.id })
  },
)
