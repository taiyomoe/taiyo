import { listAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeList } from "../middlewares/authorize-list-middleware"
import { checkList } from "../middlewares/check-list-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import {
  findMissingMediaIds,
  listMediaIdsSchema,
  replaceListItems,
  touchList,
} from "../utils/user-lists"

const updateListSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(config.input.maxNameLength)
      .optional()
      .meta({ description: "The name of the list.", example: "Best shounen" }),
    description: z
      .string()
      .trim()
      .max(config.input.maxDescriptionLength)
      .nullable()
      .optional()
      .meta({
        description: "The description of the list, or `null` to clear it.",
        example: "Fights, friendship and training arcs.",
      }),
    visibility: z.enum(USER_LIST_VISIBILITIES).optional().meta({
      description: "Who can see the list: everyone (`PUBLIC`) or only its owner (`PRIVATE`).",
      example: "PUBLIC",
    }),
    mediaIds: listMediaIdsSchema.optional().meta({
      description: `The IDs of the medias to put on the list, in order, replacing the current ones. At most ${config.lists.maxItems}, without duplicates.`,
    }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateListHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a list",
    description:
      "Updates the name, description or visibility of a list, and can replace its titles in order. Send at least one field. Titles kept on the list keep the date they were added. Moderators and admins can also update the `PUBLIC` lists of other users.\n\n**Required access:** the owner of the list, or a moderator or admin.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "List updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the list." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are neither the owner of the list nor a moderator or admin, or the list is someone else's `PRIVATE` list.",
        404: "No list with the given ID exists, or one of the medias does not exist.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(listAudit.UPDATE),
  withAuth(),
  validateJson(updateListSchema),
  checkList(),
  authorizeList("update"),
  withTransaction,
  async (c) => {
    const { db, list } = c.var
    const { mediaIds, ...body } = c.var.json
    const updates: Record<string, unknown> = {}

    for (const key of ["name", "description", "visibility"] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (mediaIds === undefined) {
      c.var.audit.set({ changes: auditChanges(list, updates) })
    } else {
      if ((await findMissingMediaIds(db, mediaIds)).length > 0) {
        return c.fail("MEDIA_NOT_FOUND")
      }

      const current = await db
        .selectFrom("userListItems")
        .select("mediaId")
        .where("listId", "=", list.id)
        .orderBy("position", "asc")
        .orderBy("addedAt", "asc")
        .execute()

      c.var.audit.set({
        changes: auditChanges(
          { ...list, mediaIds: current.map((item) => item.mediaId) },
          { ...updates, mediaIds },
        ),
      })

      await replaceListItems(db, list.id, mediaIds)
      await touchList(db, list.id)
    }

    if (Object.keys(updates).length > 0) {
      await db.updateTable("userLists").set(updates).where("id", "=", list.id).execute()
    }

    return c.ok({ id: list.id })
  },
)
