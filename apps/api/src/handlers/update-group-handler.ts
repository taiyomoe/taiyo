import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  groupDiscordSchema,
  groupEmailSchema,
  groupLinkSchema,
} from "../utils/schemas"

const urlField = () => z.string().max(config.input.maxUrlLength).nullable().optional()
const updateGroupSchema = z
  .object({
    name: z.string().min(1).max(config.input.maxNameLength).optional(),
    description: z.string().max(config.input.maxDescriptionLength).nullable().optional(),
    logo: urlField(),
    banner: urlField(),
    website: groupLinkSchema("Website URL."),
    discord: groupDiscordSchema,
    x: groupLinkSchema("X / Twitter URL."),
    facebook: groupLinkSchema("Facebook URL."),
    instagram: groupLinkSchema("Instagram URL."),
    telegram: groupLinkSchema("Telegram URL."),
    youtube: groupLinkSchema("YouTube URL."),
    email: groupEmailSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateGroupHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a group",
    description:
      "Updates a group. Omitted fields are kept as-is. Send `null` to clear a nullable field.\n\n**Authentication:** uploader, moderator, admin — or a group owner or member with `EDIT_GROUP`.",
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
  withAuth(),
  validateJson(updateGroupSchema),
  checkGroup(),
  authorizeGroup("update"),
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
