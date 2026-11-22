import type { NewStaff } from "@taiyomoe/db"
import { staffAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
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
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  fileSchema,
  localizedTextSchema,
  staffLinksSchema,
} from "../utils/schemas"

const createStaffSchema = z.object({
  name: z.string().min(1).max(config.input.maxNameLength).meta({
    description: "The name of the staff.",
    example: "Kishimoto Masashi",
  }),
  bio: localizedTextSchema
    .optional()
    .meta({ description: "The biography of the staff, keyed by language code." }),
  links: staffLinksSchema
    .optional()
    .meta({ description: "The links of the staff, keyed by provider." }),
  file: fileSchema("The image of the staff.").optional(),
})

export const createStaffHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a staff",
    description:
      "Creates a staff, optionally with a biography, links and an image.\n\n**Required roles:** uploader intern, uploader, admin.",
    tags: ["Staffs"],
    responses: {
      201: {
        description: "Staff created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new staff." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: `The request body failed validation, or the image is invalid, larger than ${config.images.maxSizeBytes / 1024 / 1024} MB or has too many pixels or frames.`,
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(staffAudit.CREATE),
  withAuth("staff.create"),
  rateLimit({ prefix: "create-staff", windowMs: 60_000, limit: 30 }),
  bodyLimit({
    maxSize: config.images.maxSizeBytes + 64 * 1024,
    onError: (c) => c.fail("IMAGE_TOO_LARGE"),
  }),
  validateFormData(createStaffSchema),
  checkImages(),
  transcodeSlot,
  withTransaction,
  async (c) => {
    const { db, log, user } = c.var
    const body = c.var.formData
    const id = crypto.randomUUID()

    log.set({ staff: { id } })

    let imageKey: string | null = null

    if (body.file) {
      imageKey = (await putImage(c.var, { kind: "staff", staffId: id }, body.file)).key
    }

    const values: NewStaff = { id, creatorId: user.id, name: body.name }

    if (body.bio !== undefined) {
      values.bio = body.bio
    }

    if (body.links !== undefined) {
      values.links = body.links
    }

    if (imageKey !== null) {
      values.image = imageKey
    }

    const staff = await db
      .insertInto("staffs")
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow()

    log.set({ staff })
    c.var.audit.set({ target: { id: staff.id, name: staff.name } })

    return c.ok({ id: staff.id })
  },
)
