import { Hono } from "hono"
import { acceptMediaSuggestionHandler } from "../handlers/accept-media-suggestion-handler"
import { getMediaSuggestionHandler } from "../handlers/get-media-suggestion-handler"
import { listMediaSuggestionsHandler } from "../handlers/list-media-suggestions-handler"
import { rejectMediaSuggestionHandler } from "../handlers/reject-media-suggestion-handler"
import { updateMediaSuggestionHandler } from "../handlers/update-media-suggestion-handler"
import { withdrawMediaSuggestionHandler } from "../handlers/withdraw-media-suggestion-handler"

export const mediaSuggestionsRouter = new Hono()
  .route("/", listMediaSuggestionsHandler)
  .route("/", getMediaSuggestionHandler)
  .route("/", updateMediaSuggestionHandler)
  .route("/", withdrawMediaSuggestionHandler)
  .route("/", acceptMediaSuggestionHandler)
  .route("/", rejectMediaSuggestionHandler)
