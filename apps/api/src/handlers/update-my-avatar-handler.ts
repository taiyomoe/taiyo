import { userAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { getPublicImageUrl, S3_PUBLIC_BASE } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { bodyLimit } from "hono/body-limit"
import z from "zod"
import { putImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { checkImages } from "../middlewares/check-images-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { transcodeSlot } from "../middlewares/transcode-slot-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { imageCropSchema, PROFILE_IMAGE_SIZES } from "../utils/image-crop"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope, fileSchema } from "../utils/schemas"

const bodySchema = z.object({
  file: fileSchema("The original image, in PNG, JPEG, GIF or WebP. Animated GIFs stay animated."),
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
    summary: "Update my avatar",
    description: `Updates your avatar: crops the uploaded image to a ${PROFILE_IMAGE_SIZES.avatar.width}×${PROFILE_IMAGE_SIZES.avatar.height} square and replaces your previous uploaded avatar.\n\n**Authentication:** signed-in user.`,
    tags: ["Profile"],
    responses: {
      200: {
        description: "Avatar updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ image: z.url().meta({ description: "The URL of your new avatar." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: `The request body failed validation, the file is not a valid image, is larger than ${config.images.maxSizeBytes / 1024 / 1024} MB or has too many pixels or animation frames, or the crop rotates a GIF.`,
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(userAudit.AVATAR_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  rateLimit({ prefix: "update-avatar", windowMs: 60_000, limit: 10 }),
  // One image and a few fields.
  bodyLimit({
    maxSize: config.images.maxSizeBytes + 64 * 1024,
    onError: (c) => c.fail("IMAGE_TOO_LARGE"),
  }),
  validateFormData(bodySchema),
  checkImages(),
  transcodeSlot,
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
