import { config } from "@taiyomoe/config"
import type { NewGroup } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const urlField = (description: string) =>
  z.string().max(config.input.maxUrlLength).nullable().optional().meta({ description })
const createGroupSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(config.input.maxNameLength)
    .meta({ description: "Name of the group.", example: "Akira Scans" }),
  description: z
    .string()
    .max(config.input.maxDescriptionLength)
    .nullable()
    .optional()
    .meta({ description: "Description of the group." }),
  logo: urlField("Storage key of the group logo."),
  banner: urlField("Storage key of the group banner."),
  website: urlField("Website URL."),
  discord: urlField("Discord invite or server URL."),
  x: urlField("X / Twitter URL."),
  facebook: urlField("Facebook URL."),
  instagram: urlField("Instagram URL."),
  telegram: urlField("Telegram URL."),
  youtube: urlField("YouTube URL."),
  email: z
    .string()
    .max(config.input.maxUrlLength)
    .nullable()
    .optional()
    .meta({ description: "Contact email." }),
})

export const createGroupHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a group",
    description:
      "Creates a group.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Groups"],
    requestBody: {
      content: { "application/json": await resolver(createGroupSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Group created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the newly created group." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The request data failed validation." }),
    },
  }),
  withAuth("create", "Group"),
  validateJson(createGroupSchema),
  withTransaction,
  async (c) => {
    const { db, log, user } = c.var
    const body = c.var.json
    const id = crypto.randomUUID()

    log.set({ group: { id } })

    const values: NewGroup = { id, creatorId: user.id, name: body.name }

    for (const key of [
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
        values[key] = body[key]
      }
    }

    await db.insertInto("groups").values(values).execute()

    return c.ok({ id })
  },
)
