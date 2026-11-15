import { listAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { findMissingMediaIds, listMediaIdsSchema, replaceListItems } from "../utils/user-lists"

const createListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(config.input.maxNameLength)
    .meta({ description: "The name of the list.", example: "Best shounen" }),
  description: z.string().trim().max(config.input.maxDescriptionLength).nullable().optional().meta({
    description: "The description of the list, if any.",
    example: "Battle manga I keep coming back to.",
  }),
  visibility: z
    .enum(USER_LIST_VISIBILITIES)
    .default("PRIVATE")
    .meta({ description: "Who can see the list. Defaults to PRIVATE.", example: "PUBLIC" }),
  mediaIds: listMediaIdsSchema.default([]),
})

export const createListHandler = new Hono().post(
  "/me/lists",
  describeRoute({
    summary: "Create a list",
    description: `Creates a custom list, optionally with its titles in order. You can own at most ${config.lists.maxPerUser} lists.\n\n**Authentication:** signed-in user.`,
    tags: ["Custom lists"],
    responses: {
      201: {
        description: "List created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the list." }),
                  visibility: z
                    .enum(USER_LIST_VISIBILITIES)
                    .meta({ description: "Who can see the list.", example: "PRIVATE" }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "One of the media does not exist.",
        409: "You already own the maximum number of lists.",
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(listAudit.CREATE),
  withAuth(),
  validateJson(createListSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { name, description, visibility, mediaIds } = c.var.json
    const owned = await db
      .selectFrom("userLists")
      .where("userId", "=", user.id)
      .where("deletedAt", "is", null)
      .select(db.fn.countAll<string>().as("count"))
      .executeTakeFirstOrThrow()

    if (Number(owned.count) >= config.lists.maxPerUser) {
      return c.fail("LIST_LIMIT_REACHED")
    }

    if ((await findMissingMediaIds(db, mediaIds)).length > 0) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const row = await db
      .insertInto("userLists")
      .values({
        userId: user.id,
        name,
        description: description ?? null,
        visibility,
      })
      .returning(["id", "visibility"])
      .executeTakeFirstOrThrow()

    await replaceListItems(db, row.id, mediaIds)

    c.var.audit.set({ target: { id: row.id, name } })

    return c.ok({ id: row.id, visibility: row.visibility })
  },
)
