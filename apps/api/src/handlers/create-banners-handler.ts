import type { NewBanner } from "@taiyomoe/db"
import { bannerAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { putImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { checkImages } from "../middlewares/check-images-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, fileSchema } from "../utils/schemas"

const createBannersSchema = z.object({
  banners: z
    .object({
      file: fileSchema("The file of the banner."),
      contentRating: contentRatingSchema("The content rating of the banner."),
    })
    .array()
    .min(1)
    .meta({
      description: "The banners to add to the media.",
      examples: [{ file: "banner-1.jpg", contentRating: "NORMAL" }],
    }),
})

export const createBannersHandler = new Hono().post(
  "/:id/banners",
  describeRoute({
    summary: "Add banners to a media",
    description:
      "Adds one or more banners to a media.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Banners"],
    requestBody: {
      content: {
        "multipart/form-data": await resolver(createBannersSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Banners added.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  ids: z
                    .uuid()
                    .array()
                    .meta({ description: "The IDs of the newly created banners." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: `The request data failed validation, or an uploaded image is invalid or larger than ${config.images.maxSizeBytes / 1024 / 1024} MB.`,
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(bannerAudit.CREATE),
  withAuth("media.update"),
  rateLimit({ prefix: "create-banners", windowMs: 60_000, limit: 10 }),
  validateFormData(createBannersSchema),
  checkImages(),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media, user } = c.var
    const body = c.var.formData
    const bannerRows = await Promise.all(
      body.banners.map(async (banner) => {
        const id = crypto.randomUUID()
        const { extension } = await putImage(
          c.var,
          { kind: "banner", mediaId: media.id, id },
          banner.file,
        )

        return {
          id,
          mediaId: media.id,
          extension,
          contentRating: banner.contentRating,
          uploaderId: user.id,
        } satisfies NewBanner
      }),
    )

    await db.insertInto("banners").values(bannerRows).execute()

    c.var.audit.set({ target: { bannerIds: bannerRows.map((row) => row.id) } })

    return c.ok({ ids: bannerRows.map((row) => row.id) })
  },
)
