import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  mediaSuggestionSchema,
  searchSuggestions,
  selectSuggestionColumns,
  selectSuggestions,
  toSuggestionSummaries,
} from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description:
      "Only list the suggestions on a media with a title containing this text, or by an author whose name contains it.",
    example: "one punch",
  }),
})

export const listMediaSuggestionsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List pending media suggestions",
    description:
      "Lists the media suggestions waiting for review, oldest first, with the fields each one changes and the ones that changed on the media since. Suggestions on deleted media are left out.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "The pending media suggestions.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(mediaSuggestionSchema.array(), paginationMetaSchema),
            ),
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
  withAuth("mediaSuggestion.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search } = c.var.query
    const base = searchSuggestions(
      selectSuggestions(db).where("mediaSuggestions.status", "=", "PENDING"),
      search,
      { byAuthor: true },
    )
    const [rows, totalRow] = await Promise.all([
      selectSuggestionColumns(base)
        .orderBy("mediaSuggestions.createdAt", "asc")
        .orderBy("mediaSuggestions.id", "asc")
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
