import { type DB, type ExpressionBuilder, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { escapeLike } from "../utils/escape-like"
import { getMainCoverUrls } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { listSummarySchema, selectListSummaries } from "../utils/user-lists"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description:
      "Only list the lists whose name or owner's username contains this text, ignoring case.",
    example: "shounen",
  }),
})
const managedListSchema = listSummarySchema
  .pick({
    id: true,
    name: true,
    description: true,
    visibility: true,
    itemCount: true,
    upvoteCount: true,
    createdAt: true,
    updatedAt: true,
    owner: true,
  })
  .extend({
    coverUrl: z
      .url()
      .nullable()
      .meta({ description: "The URL of the main cover of the first title on the list, if any." }),
  })

export const listManagedListsHandler = new Hono().get(
  "/managed",
  describeRoute({
    summary: "List lists for management",
    description:
      "Lists every `PUBLIC` list for management, newest first, with its owner and the cover of its first title. `PRIVATE` lists are left out.\n\n**Required roles:** moderator, admin.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "The matching lists.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedListSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("list.moderate"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search } = c.var.query
    const matches = (eb: ExpressionBuilder<DB, "userLists" | "users">) =>
      eb.and([
        eb("userLists.visibility", "=", "PUBLIC"),
        ...(search === undefined
          ? []
          : [
              eb.or([
                eb("userLists.name", "ilike", `%${escapeLike(search)}%`),
                eb("users.username", "ilike", `%${escapeLike(search)}%`),
              ]),
            ]),
      ])
    const [rows, totalRow] = await Promise.all([
      selectListSummaries(db, null)
        .where(matches)
        .orderBy("userLists.createdAt", "desc")
        .orderBy("userLists.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userLists")
        .innerJoin("users", "users.id", "userLists.userId")
        .where("userLists.deletedAt", "is", null)
        .where(matches)
        .select(sql<string>`count(*)`.as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const firstItems =
      rows.length === 0
        ? []
        : await db
            .selectFrom("userListItems")
            .innerJoin("medias", "medias.id", "userListItems.mediaId")
            .distinctOn("userListItems.listId")
            .select(["userListItems.listId", "userListItems.mediaId"])
            .where(
              "userListItems.listId",
              "in",
              rows.map((row) => row.id),
            )
            .where("medias.deletedAt", "is", null)
            .orderBy("userListItems.listId")
            .orderBy("userListItems.position", "asc")
            .orderBy("userListItems.addedAt", "asc")
            .execute()
    const coverUrls = await getMainCoverUrls(
      db,
      firstItems.map((item) => item.mediaId),
    )
    const coverUrlByList = new Map(
      firstItems.map((item) => [item.listId, coverUrls.get(item.mediaId) ?? null]),
    )

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        visibility: row.visibility,
        itemCount: Number(row.itemCount ?? 0),
        upvoteCount: row.upvoteCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        owner: {
          id: row.ownerId,
          username: row.ownerUsername,
          displayUsername: row.ownerDisplayUsername,
          image: row.ownerImage,
          nameEffect: row.ownerNameEffect,
          avatarBorder: row.ownerAvatarBorder,
        },
        coverUrl: coverUrlByList.get(row.id) ?? null,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
