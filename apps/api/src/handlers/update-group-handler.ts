import { config } from "@taiyomoe/config"
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

const urlField = () => z.string().max(config.input.maxUrlLength).nullable().optional()
const updateGroupSchema = z
  .object({
    name: z.string().min(1).max(config.input.maxNameLength).optional(),
    description: z.string().max(config.input.maxDescriptionLength).nullable().optional(),
    logo: urlField(),
    banner: urlField(),
    website: urlField(),
    discord: urlField(),
    x: urlField(),
    facebook: urlField(),
    instagram: urlField(),
    telegram: urlField(),
    youtube: urlField(),
    email: urlField(),
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
