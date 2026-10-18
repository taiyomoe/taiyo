import type { NewGroup } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
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
  website: groupLinkSchema("Website URL."),
  discord: groupDiscordSchema,
  x: groupLinkSchema("X / Twitter URL."),
  facebook: groupLinkSchema("Facebook URL."),
  instagram: groupLinkSchema("Instagram URL."),
  telegram: groupLinkSchema("Telegram URL."),
  youtube: groupLinkSchema("YouTube URL."),
  email: groupEmailSchema,
})

export const createGroupHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a group",
    description: "Creates a group.\n\n**Required roles:** uploader, admin.",
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
  withAuth("group.create"),
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
