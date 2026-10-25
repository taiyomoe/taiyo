import { MEDIA_SUGGESTION_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  mediaSuggestionSchema,
  selectSuggestionColumns,
  selectSuggestions,
  toSuggestionSummaries,
} from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(MEDIA_SUGGESTION_STATUSES)
    .optional()
    .meta({ description: "Only list suggestions with this status." }),
})

export const listMyMediaSuggestionsHandler = new Hono().get(
  "/me/media-suggestions",
  describeRoute({
    summary: "List my media suggestions",
    description:
      "Lists the media edits the current user suggested, newest first, with what reviewers accepted.\n\n**Authentication:** signed-in user.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "The current user's suggestions.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(mediaSuggestionSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage, status } = c.var.query
    const base = selectSuggestions(db)
      .where("mediaSuggestions.authorId", "=", user.id)
      .where((eb) =>
        status === undefined ? eb.and([]) : eb("mediaSuggestions.status", "=", status),
      )
    const [rows, totalRow] = await Promise.all([
      selectSuggestionColumns(base)
        .orderBy("mediaSuggestions.createdAt", "desc")
        .orderBy("mediaSuggestions.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(await toSuggestionSummaries(db, rows), {
      page,
      perPage,
      total: Number(totalRow.count),
    })
  },
)
