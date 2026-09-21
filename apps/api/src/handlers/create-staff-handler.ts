import { config } from "@taiyomoe/config"
import { NewStaff } from "@taiyomoe/db"
import { getStaffImageKey } from "@taiyomoe/s3"
import { extensionForMimeType } from "@taiyomoe/utils"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkImages } from "../middlewares/check-images-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
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

const createStaffSchema = z.object({
  name: z.string().min(1).max(config.input.maxNameLength).meta({
    description: "Name of the staff member.",
    example: "Kishimoto Masashi",
  }),
  bio: localizedTextSchema.optional(),
  links: staffLinksSchema.optional(),
  file: fileSchema("Optional image for the staff.").optional(),
})

export const createStaffHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a staff",
    description:
      "Creates a staff member.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Staffs"],
    requestBody: {
      content: {
        "multipart/form-data": await resolver(createStaffSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Staff created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the newly created staff." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The request data failed validation or the uploaded image is invalid.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  withAuth("create", "Staff"),
  rateLimit({ prefix: "create-staff", windowMs: 60_000, limit: 30 }),
  validateFormData(createStaffSchema),
  checkImages(),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, log, user } = c.var
    const body = c.var.formData!
    const id = crypto.randomUUID()

    log.set({ staff: { id } })

    let imageKey: string | null = null

    if (body.file) {
      imageKey = getStaffImageKey(id, `image.${extensionForMimeType(body.file.type)}`)
      await uploadFile({ s3, s3Bucket, log }, imageKey, body.file)
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

    return c.ok({ id: staff.id })
  },
)
