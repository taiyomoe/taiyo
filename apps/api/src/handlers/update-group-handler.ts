import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { requireGroupAccess } from "../middlewares/require-group-access-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const updateGroupSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    banner: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    discord: z.string().nullable().optional(),
    x: z.string().nullable().optional(),
    facebook: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
    telegram: z.string().nullable().optional(),
    youtube: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateGroupHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a group",
    description:
      "Updates a group. Omitted fields are kept as-is. Send `null` to clear a nullable field.\n\n**Authentication:** uploader intern, uploader, moderator, admin — or any signed-in member of the group.",
    tags: ["Groups"],
    requestBody: {
      content: { "application/json": await resolver(updateGroupSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Group updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated group." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateJson(updateGroupSchema),
  checkGroup(),
  requireGroupAccess,
  withTransaction,
  async (c) => {
    const { db, group } = c.var
    const body = c.var.json
    const updates: Record<string, unknown> = {}

    for (const key of [
      "name",
      "description",
      "logo",
      "banner",
      "website",
      "discord",
      "x",
      "facebook",
      "instagram",
      "telegram",
      "youtube",
      "email",
    ] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    await db.updateTable("groups").set(updates).where("id", "=", group.id).execute()

    return c.ok({ id: group.id })
  },
)
