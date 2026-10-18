import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { mediaSuggestionDetailSchema, toSuggestionDetail } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getMediaSuggestionHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a media suggestion",
    description:
      "Returns a suggestion with, for each field it changes, the suggested value, the value when it was made, and the value on the media right now.\n\n**Authentication:** the author of the suggestion, or an uploader, moderator or admin.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "The suggestion.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaSuggestionDetailSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No suggestion with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkMediaSuggestion(),
  async (c) => c.ok(await toSuggestionDetail(c.var.db, c.var.mediaSuggestion)),
)
