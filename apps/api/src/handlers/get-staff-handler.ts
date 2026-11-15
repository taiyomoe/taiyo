import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkStaff } from "../middlewares/check-staff-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, staffLinksSchema, storedLocalizedTextSchema } from "../utils/schemas"

const staffDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "The name of the staff.", example: "Kishimoto Masashi" }),
  bio: storedLocalizedTextSchema.meta({
    description: "The biography of the staff, keyed by language code.",
  }),
  links: staffLinksSchema.meta({ description: "The links of the staff, keyed by provider." }),
  imageUrl: z.url().nullable().meta({ description: "The URL of the staff's image, if any." }),
  createdAt: z.iso.datetime().meta({ description: "When the staff was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the staff was last updated." }),
})

export const getStaffHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a staff",
    description: "Returns a staff by ID.\n\n**Authentication:** none.",
    tags: ["Staffs"],
    responses: {
      200: {
        description: "The staff.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(staffDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No staff with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  checkStaff(),
  (c) => {
    const { staff } = c.var

    return c.ok({
      id: staff.id,
      name: staff.name,
      bio: staff.bio,
      links: staff.links,
      imageUrl: staff.image === null ? null : getPublicImageUrl(staff.image),
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    })
  },
)
