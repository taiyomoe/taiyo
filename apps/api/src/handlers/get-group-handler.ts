import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const groupDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "Name of the group." }),
  description: z.string().nullable(),
  logo: z.string().nullable(),
  banner: z.string().nullable(),
  website: z.string().nullable(),
  discord: z.string().nullable(),
  x: z.string().nullable(),
  facebook: z.string().nullable(),
  instagram: z.string().nullable(),
  telegram: z.string().nullable(),
  youtube: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const getGroupHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a group",
    description: "Fetches a group by id.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "Group details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkGroup(),
  async (c) => {
    const { group } = c.var

    return c.ok({
      id: group.id,
      name: group.name,
      description: group.description,
      logo: group.logo,
      banner: group.banner,
      website: group.website,
      discord: group.discord,
      x: group.x,
      facebook: group.facebook,
      instagram: group.instagram,
      telegram: group.telegram,
      youtube: group.youtube,
      email: group.email,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    })
  },
)
