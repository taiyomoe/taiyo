import { userAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { putImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { checkImages } from "../middlewares/check-images-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { imageCropSchema, PROFILE_IMAGE_SIZES } from "../utils/image-crop"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, fileSchema } from "../utils/schemas"

const bodySchema = z.object({
  file: fileSchema("The original image. Animated GIFs stay animated."),
  crop: imageCropSchema,
})

export const updateMyBannerHandler = new Hono().put(
  "/me/banner",
  describeRoute({
    summary: "Change my profile banner",
    description: `Crops the uploaded image to ${PROFILE_IMAGE_SIZES.banner.width}×${PROFILE_IMAGE_SIZES.banner.height} and makes it your profile banner. The previous banner is deleted.\n\n**Authentication:** signed-in user.`,
    tags: ["Profile"],
    requestBody: {
      content: { "multipart/form-data": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Banner changed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ bannerUrl: z.url() }))),
          },
        },
      },
      ...getOpenApiResponses({
        422: `The request data failed validation, the crop is invalid, or the image is invalid or larger than ${config.images.maxSizeBytes / 1024 / 1024} MB.`,
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(userAudit.BANNER_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  rateLimit({ prefix: "update-profile-banner", windowMs: 60_000, limit: 10 }),
  validateFormData(bodySchema),
  checkImages(),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { file, crop } = c.var.formData

    if (file.type === "image/gif" && crop.rotation !== 0) {
      return c.fail("INVALID_CROP")
    }

    const profile = await db
      .selectFrom("userProfiles")
      .select("banner")
      .where("userId", "=", user.id)
      .forUpdate()
      .executeTakeFirst()
    const { key } = await putImage(c.var, { kind: "profileBanner", userId: user.id }, file, {
      replaces: profile?.banner ?? null,
      crop: { area: crop, ...PROFILE_IMAGE_SIZES.banner },
    })

    await db
      .insertInto("userProfiles")
      .values({ userId: user.id, banner: key })
      .onConflict((oc) => oc.column("userId").doUpdateSet({ banner: key }))
      .execute()

    return c.ok({ bannerUrl: getPublicImageUrl(key) })
  },
)
