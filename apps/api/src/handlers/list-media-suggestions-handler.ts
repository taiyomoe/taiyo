import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
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

export const listMediaSuggestionsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List media suggestions waiting for review",
    description:
      "Lists pending media suggestions, oldest first, with the fields each one changes and the ones that changed on the media since.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "Suggestions waiting for review.",
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
  withAuth("mediaSuggestion.review"),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage } = c.var.query
    const base = selectSuggestions(db).where("mediaSuggestions.status", "=", "PENDING")
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
