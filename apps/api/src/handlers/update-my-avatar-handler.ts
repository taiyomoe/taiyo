import { userAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { getPublicImageUrl, S3_PUBLIC_BASE } from "@taiyomoe/s3"
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
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope, fileSchema } from "../utils/schemas"

const bodySchema = z.object({
  file: fileSchema("The original image. Animated GIFs stay animated."),
  crop: imageCropSchema,
})

export const getOwnedAvatarKey = (userId: string, image: string | null) => {
  const prefix = `${S3_PUBLIC_BASE}/`

  return image?.startsWith(`${prefix}users/${userId}/avatars/`) === true
    ? image.slice(prefix.length)
    : null
}

export const updateMyAvatarHandler = new Hono().put(
  "/me/avatar",
  describeRoute({
    summary: "Change my avatar",
    description: `Crops the uploaded image to a ${PROFILE_IMAGE_SIZES.avatar.width}×${PROFILE_IMAGE_SIZES.avatar.height} square and makes it your avatar. The previous uploaded avatar is deleted.\n\n**Authentication:** signed-in user.`,
    tags: ["Profile"],
    requestBody: {
      content: { "multipart/form-data": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Avatar changed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ image: z.url() }))),
          },
        },
      },
      ...getOpenApiResponses({
        422: `The request data failed validation, the crop is invalid, or the image is invalid or larger than ${config.images.maxSizeBytes / 1024 / 1024} MB.`,
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(userAudit.AVATAR_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  rateLimit({ prefix: "update-avatar", windowMs: 60_000, limit: 10 }),
  validateFormData(bodySchema),
  checkImages(),
  withTransaction,
  async (c) => {
    const { auth, db, user } = c.var
    const { file, crop } = c.var.formData

    if (file.type === "image/gif" && crop.rotation !== 0) {
      return c.fail("INVALID_CROP")
    }

    const { key } = await putImage(c.var, { kind: "avatar", userId: user.id }, file, {
      replaces: getOwnedAvatarKey(user.id, user.image ?? null),
      crop: { area: crop, ...PROFILE_IMAGE_SIZES.avatar },
    })
    const image = getPublicImageUrl(key)

    await db.updateTable("users").set({ image }).where("id", "=", user.id).execute()

    c.var.afterCommit(() => refreshUserSessions(auth, user.id))

    return c.ok({ image })
  },
)
