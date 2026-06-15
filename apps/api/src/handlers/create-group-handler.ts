import type { NewGroup } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const createGroupSchema = z.object({
  name: z.string().min(1).meta({ description: "Name of the group.", example: "Akira Scans" }),
  description: z.string().nullable().optional().meta({ description: "Description of the group." }),
  logo: z.string().nullable().optional().meta({ description: "Storage key of the group logo." }),
  banner: z
    .string()
    .nullable()
    .optional()
    .meta({ description: "Storage key of the group banner." }),
  website: z.string().nullable().optional().meta({ description: "Website URL." }),
  discord: z.string().nullable().optional().meta({ description: "Discord invite or server URL." }),
  x: z.string().nullable().optional().meta({ description: "X / Twitter URL." }),
  facebook: z.string().nullable().optional().meta({ description: "Facebook URL." }),
  instagram: z.string().nullable().optional().meta({ description: "Instagram URL." }),
  telegram: z.string().nullable().optional().meta({ description: "Telegram URL." }),
  youtube: z.string().nullable().optional().meta({ description: "YouTube URL." }),
  email: z.string().nullable().optional().meta({ description: "Contact email." }),
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
