import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"
import { listSummarySchema, selectListSummaries, toListSummaries } from "../utils/user-lists"

const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  mediaId: z.uuid().optional().meta({
    description: "The ID of a media to look up: each list then says whether it holds that media.",
  }),
})
const myListSchema = listSummarySchema.extend({
  hasMedia: z.boolean().nullable().meta({
    description: "Whether the list holds the media given in `mediaId`, if any.",
  }),
})

export const listMyListsHandler = new Hono().get(
  "/me/lists",
  describeRoute({
    summary: "List my lists",
    description:
      "Lists your custom lists, most recently updated first. Pass `mediaId` to also learn which of them hold that media.\n\n**Authentication:** signed-in user.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "Your custom lists.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(myListSchema.array(), paginationMetaSchema)),
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
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage, contentRating, mediaId } = c.var.query
    const [rows, totalRow] = await Promise.all([
      selectListSummaries(db, user.id)
        .where("userLists.userId", "=", user.id)
        .select((eb) =>
          mediaId === undefined
            ? sql<boolean | null>`null`.as("hasMedia")
            : eb
                .exists(
                  eb
                    .selectFrom("userListItems")
                    .select("userListItems.listId")
                    .whereRef("userListItems.listId", "=", "userLists.id")
                    .where("userListItems.mediaId", "=", mediaId),
                )
                .as("hasMedia"),
        )
        .orderBy("userLists.updatedAt", "desc")
        .orderBy("userLists.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userLists")
        .where("userId", "=", user.id)
        .where("deletedAt", "is", null)
        .select(db.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const summaries = await toListSummaries(db, rows, contentRating)

    return c.ok(
      summaries.map(({ hasMedia, ...list }) => ({
        ...list,
        hasMedia: hasMedia === null ? null : hasMedia === true || hasMedia === 1,
      })),
      {
        page,
        perPage,
        total: Number(totalRow.count),
      },
    )
  },
)
