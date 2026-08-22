import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkStaff } from "../middlewares/check-staff-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, localizedTextSchema, staffLinksSchema } from "../utils/schemas"

const staffDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "Name of the staff.", example: "Kishimoto Masashi" }),
  bio: localizedTextSchema,
  links: staffLinksSchema,
  image: z.string().nullable().meta({ description: "Storage key of the staff image, if any." }),
  createdAt: z.iso.datetime().meta({ description: "When the staff was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the staff was last updated." }),
})

export const getStaffHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a staff",
    description: "Fetches a staff by id.\n\n**Authentication:** none.",
    tags: ["Staffs"],
    responses: {
      200: {
        description: "Staff details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(staffDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No staff with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkStaff(),
  async (c) => {
    const { staff } = c.var

    return c.ok({
      id: staff.id,
      name: staff.name,
      bio: staff.bio,
      links: staff.links,
      image: staff.image,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    })
  },
)
