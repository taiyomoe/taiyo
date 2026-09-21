import { config } from "@taiyomoe/config"
import { getStaffImageKey } from "@taiyomoe/s3"
import { extensionForMimeType } from "@taiyomoe/utils"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkImages } from "../middlewares/check-images-middleware"
import { checkStaff } from "../middlewares/check-staff-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  fileSchema,
  localizedTextSchema,
  staffLinksSchema,
} from "../utils/schemas"
import { uploadFile } from "../utils/upload-file"

const updateStaffSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(config.input.maxNameLength)
      .optional()
      .meta({ description: "New name of the staff.", example: "Kishimoto Masashi" }),
    bio: localizedTextSchema.optional(),
    links: staffLinksSchema.optional(),
    file: fileSchema("Optional new image for the staff. Replaces any current image.").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateStaffHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a staff",
    description:
      "Updates a staff. Omitted fields are kept as-is. For `bio` and `links`, only the provided keys are touched; send an empty value for a key to clear it.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Staffs"],
    requestBody: {
      content: {
        "multipart/form-data": await resolver(updateStaffSchema).toOpenAPISchema(),
      },
    },
    responses: {
      200: {
        description: "Staff updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated staff." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No staff with the given id exists.",
        422: "The request data failed validation or the uploaded image is invalid.",
      }),
    },
  }),
  withAuth("update", "Staff"),
  validateFormData(updateStaffSchema),
  checkImages(),
  checkStaff(),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, log, staff } = c.var
    const body = c.var.formData!
    const updates: Record<string, unknown> = {}

    if (body.file) {
      const imageKey = getStaffImageKey(staff.id, `image.${extensionForMimeType(body.file.type)}`)

      await uploadFile({ s3, s3Bucket, log }, imageKey, body.file)
      updates.image = imageKey
    }

    if (body.name !== undefined) {
      updates.name = body.name
    }

    if (body.bio !== undefined) {
      const merged: Record<string, string> = { ...(staff.bio as Record<string, string>) }

      for (const [lang, value] of Object.entries(body.bio)) {
        if (value === "") {
          delete merged[lang]
        } else if (typeof value === "string") {
          merged[lang] = value
        }
      }

      updates.bio = merged
    }

    if (body.links !== undefined) {
      const merged: Record<string, string> = { ...(staff.links as Record<string, string>) }

      for (const [provider, value] of Object.entries(body.links)) {
        if (value === "") {
          delete merged[provider]
        } else if (typeof value === "string") {
          merged[provider] = value
        }
      }

      updates.links = merged
    }

    await db.updateTable("staffs").set(updates).where("id", "=", staff.id).execute()

    return c.ok({ id: staff.id })
  },
)
