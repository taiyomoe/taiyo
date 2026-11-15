import type { NewGroup } from "@taiyomoe/db"
import { groupAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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

const createGroupSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(config.input.maxNameLength)
    .meta({ description: "The name of the group.", example: "Akira Scans" }),
  description: z.string().max(config.input.maxDescriptionLength).nullable().optional().meta({
    description: "The description of the group.",
    example: "Translating seinen manga into English since 2019.",
  }),
  website: groupLinkSchema("The URL of the group's website."),
  discord: groupDiscordSchema,
  x: groupLinkSchema("The URL of the group's X profile."),
  facebook: groupLinkSchema("The URL of the group's Facebook page."),
  instagram: groupLinkSchema("The URL of the group's Instagram profile."),
  telegram: groupLinkSchema("The URL of the group's Telegram channel."),
  youtube: groupLinkSchema("The URL of the group's YouTube channel."),
  email: groupEmailSchema,
})

export const createGroupHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a group",
    description:
      "Creates a group right away, without review and without any member.\n\n**Required roles:** uploader, admin.",
    tags: ["Groups"],
    responses: {
      201: {
        description: "Group created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the group." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(groupAudit.CREATE),
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

    c.var.audit.set({ target: { id, name: body.name } })

    return c.ok({ id })
  },
)
