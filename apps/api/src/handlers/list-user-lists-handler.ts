import { USER_LIST_VISIBILITIES } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"
import { listSummarySchema, selectListSummaries, toListSummaries } from "../utils/user-lists"

const querySchema = paginationQuerySchema.extend({ contentRating: contentRatingsQuerySchema })

export const listUserListsHandler = new Hono().get(
  "/:id/lists",
  describeRoute({
    summary: "List a user's lists",
    description:
      "Lists a user's custom lists, most recently updated first. Only `PUBLIC` lists are included, unless you are that user. Signed-in viewers also see whether they upvoted each list.\n\n**Authentication:** optional.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "The custom lists of the user.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(listSummarySchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer } = c.var
    const { page, perPage, contentRating } = c.var.query
    const isOwner = viewer?.id === targetUser.id
    const visibility = isOwner ? USER_LIST_VISIBILITIES : (["PUBLIC"] as const)
    const [rows, totalRow] = await Promise.all([
      selectListSummaries(db, viewer?.id ?? null)
        .where("userLists.userId", "=", targetUser.id)
        .where("userLists.visibility", "in", visibility)
        .orderBy("userLists.updatedAt", "desc")
        .orderBy("userLists.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userLists")
        .where("userId", "=", targetUser.id)
        .where("deletedAt", "is", null)
        .where("visibility", "in", visibility)
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
