import { groupAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  groupDiscordSchema,
  groupEmailSchema,
  groupLinkSchema,
} from "../utils/schemas"

const imageKeyField = (kind: "logos" | "banners") =>
  z
    .string()
    .regex(new RegExp(`^groups/[0-9a-f-]{36}/${kind}/[0-9a-f-]{36}\\.(jpg|gif)$`))
    .nullable()
    .optional()
    .meta({
      description: `The key of an image uploaded for this group, under \`groups/<id>/${kind}/\`.`,
    })
const updateGroupSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(config.input.maxNameLength)
      .optional()
      .meta({ description: "The name of the group.", example: "Akira Scans" }),
    description: z.string().max(config.input.maxDescriptionLength).nullable().optional().meta({
      description: "The description of the group.",
      example: "Translating seinen manga into English since 2019.",
    }),
    logo: imageKeyField("logos"),
    banner: imageKeyField("banners"),
    website: groupLinkSchema("The URL of the group's website."),
    discord: groupDiscordSchema,
    x: groupLinkSchema("The URL of the group's X profile."),
    facebook: groupLinkSchema("The URL of the group's Facebook page."),
    instagram: groupLinkSchema("The URL of the group's Instagram profile."),
    telegram: groupLinkSchema("The URL of the group's Telegram channel."),
    youtube: groupLinkSchema("The URL of the group's YouTube channel."),
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
      "Updates the group. Omitted fields are left unchanged, and `null` clears an optional field. A new logo or banner must be an image uploaded for this group.\n\n**Required access:** uploader, moderator or admin, or the group owner or a member with the `EDIT_GROUP` permission.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "Group updated.",
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
        403: "You cannot edit the group, or your account is banned.",
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the request body failed validation, or an image is not one uploaded for this group.",
      }),
    },
  }),
  audited(groupAudit.UPDATE),
  withAuth(),
  validateJson(updateGroupSchema),
  checkGroup(),
  authorizeGroup("update"),
  withTransaction,
  async (c) => {
    const { db, group } = c.var
    const body = c.var.json
    const updates: Record<string, unknown> = {}
    const foreignImage = (["logo", "banner"] as const).find(
      (key) => typeof body[key] === "string" && !body[key].startsWith(`groups/${group.id}/`),
    )

    if (foreignImage !== undefined) {
      return c.fail("VALIDATION_ERROR", [
        {
          code: "custom",
          path: [foreignImage],
          message: "The image must be stored under this group.",
        },
      ])
    }

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

    c.var.audit.set({ changes: auditChanges(group, updates) })

    await db.updateTable("groups").set(updates).where("id", "=", group.id).execute()

    return c.ok({ id: group.id })
  },
)
