import { NewBanner } from "@taiyomoe/db"
import { getBannerKey } from "@taiyomoe/s3"
import { extensionForMimeType } from "@taiyomoe/utils"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkImages } from "../middlewares/check-images-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, fileSchema } from "../utils/schemas"
import { uploadFile } from "../utils/upload-file"

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
      "Adds one or more banners to a media.\n\n**Required roles:** uploader, moderator, admin.",
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
        422: "The request data failed validation or an uploaded image is invalid.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  withAuth("update", "Media"),
  rateLimit({ prefix: "create-banners", windowMs: 60_000, limit: 10 }),
  validateFormData(createBannersSchema),
  checkImages(),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, log, media, user } = c.var
    const body = c.var.formData!
    const bannerRows = await Promise.all(
      body.banners.map(async (banner) => {
        const id = crypto.randomUUID()

        await uploadFile(
          { s3, s3Bucket, log },
          getBannerKey(media.id, `${id}.${extensionForMimeType(banner.file.type)}`),
          banner.file,
        )

        return {
          id,
          mediaId: media.id,
          contentRating: banner.contentRating,
          uploaderId: user.id,
        } satisfies NewBanner
      }),
    )

    await db.insertInto("banners").values(bannerRows).execute()

    return c.ok({ ids: bannerRows.map((row) => row.id) })
  },
)
