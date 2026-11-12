import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"
import {
  listSummarySchema,
  liveListMediaSql,
  selectListSummaries,
  toListSummaries,
} from "../utils/user-lists"
import { isBannedSql } from "../utils/user-moderation"

const querySchema = paginationQuerySchema.extend({ contentRating: contentRatingsQuerySchema })

export const listTopListsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List top lists",
    description:
      "Returns PUBLIC lists that hold at least one title, most upvoted first. Lists of banned users are left out.\n\n**Authentication:** optional; signed-in viewers also learn which lists they upvoted.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "The top lists.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(listSummarySchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  validateQuery(querySchema),
  withOptionalAuth,
  async (c) => {
    const { db, viewer } = c.var
    const { page, perPage, contentRating } = c.var.query
    const visible = sql<boolean>`"userLists"."visibility" = 'PUBLIC' and not (${isBannedSql}) and exists (select 1 from "userListItems" where "userListItems"."listId" = "userLists"."id" and ${liveListMediaSql})`
    const [rows, totalRow] = await Promise.all([
      selectListSummaries(db, viewer?.id ?? null)
        .where(visible)
        .orderBy("userLists.upvoteCount", "desc")
        .orderBy("userLists.createdAt", "desc")
        .orderBy("userLists.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userLists")
        .innerJoin("users", "users.id", "userLists.userId")
        .where("userLists.deletedAt", "is", null)
        .where(visible)
        .select(db.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(await toListSummaries(db, rows, contentRating), {
      page,
      perPage,
      total: Number(totalRow.count),
    })
  },
)
