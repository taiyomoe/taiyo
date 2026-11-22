import { staffAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { bodyLimit } from "hono/body-limit"
import z from "zod"
import { putImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { checkImages } from "../middlewares/check-images-middleware"
import { checkStaff } from "../middlewares/check-staff-middleware"
import { transcodeSlot } from "../middlewares/transcode-slot-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  fileSchema,
  localizedTextSchema,
  staffLinksSchema,
} from "../utils/schemas"

const updateStaffSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(config.input.maxNameLength)
      .optional()
      .meta({ description: "The new name of the staff.", example: "Oda Eiichiro" }),
    bio: localizedTextSchema.optional().meta({
      description:
        "The biography of the staff, keyed by language code. Send an empty string for a language to clear it, and omit a language to leave it unchanged.",
    }),
    links: staffLinksSchema.optional(),
    file: fileSchema("The new image of the staff. Replaces the current one.").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateStaffHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a staff",
    description:
      "Updates a staff. At least one field is required, and omitted fields are left unchanged. For `bio` and `links`, only the given keys change, and an empty string clears a key.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Staffs"],
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
        401: true,
        403: true,
        404: "No staff with the given ID exists.",
        422: `The provided ID is not a valid UUID, or the request body failed validation, or the image is invalid, larger than ${config.images.maxSizeBytes / 1024 / 1024} MB or has too many pixels or frames.`,
      }),
    },
  }),
  audited(staffAudit.UPDATE),
  withAuth("staff.update"),
  bodyLimit({
    maxSize: config.images.maxSizeBytes + 64 * 1024,
    onError: (c) => c.fail("IMAGE_TOO_LARGE"),
  }),
  validateFormData(updateStaffSchema),
  checkImages(),
  checkStaff(),
  transcodeSlot,
  withTransaction,
  async (c) => {
    const { db, staff } = c.var
    const body = c.var.formData
    const updates: Record<string, unknown> = {}

    if (body.file) {
      const { key } = await putImage(c.var, { kind: "staff", staffId: staff.id }, body.file, {
        replaces: staff.image,
      })

      updates.image = key
    }

    if (body.name !== undefined) {
      updates.name = body.name
    }

    if (body.bio !== undefined) {
      const merged = new Map(Object.entries(staff.bio as Record<string, string>))

      for (const [lang, value] of Object.entries(body.bio)) {
        if (value === "") {
          merged.delete(lang)
        } else if (typeof value === "string") {
          merged.set(lang, value)
        }
      }

      updates.bio = Object.fromEntries(merged)
    }

    if (body.links !== undefined) {
      const merged = new Map(Object.entries(staff.links as Record<string, string>))

      for (const [provider, value] of Object.entries(body.links)) {
        if (value === "") {
          merged.delete(provider)
        } else if (typeof value === "string") {
          merged.set(provider, value)
        }
      }

      updates.links = Object.fromEntries(merged)
    }

    c.var.audit.set({ changes: auditChanges(staff, updates) })

    await db.updateTable("staffs").set(updates).where("id", "=", staff.id).execute()

    return c.ok({ id: staff.id })
  },
)
