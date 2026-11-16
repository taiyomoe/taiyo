import { Hono } from "hono"
import { acceptMediaSuggestionHandler } from "../handlers/accept-media-suggestion-handler"
import { acceptMediaSuggestionsHandler } from "../handlers/accept-media-suggestions-handler"
import { getMediaSuggestionHandler } from "../handlers/get-media-suggestion-handler"
import { listMediaSuggestionsHandler } from "../handlers/list-media-suggestions-handler"
import { rejectMediaSuggestionHandler } from "../handlers/reject-media-suggestion-handler"
import { rejectMediaSuggestionsHandler } from "../handlers/reject-media-suggestions-handler"
import { updateMediaSuggestionHandler } from "../handlers/update-media-suggestion-handler"
import { withdrawMediaSuggestionHandler } from "../handlers/withdraw-media-suggestion-handler"
import { withdrawMediaSuggestionsHandler } from "../handlers/withdraw-media-suggestions-handler"

export const mediaSuggestionsRouter = new Hono()
  .route("/", listMediaSuggestionsHandler)
  .route("/", withdrawMediaSuggestionsHandler)
  .route("/", acceptMediaSuggestionsHandler)
  .route("/", rejectMediaSuggestionsHandler)
  .route("/", getMediaSuggestionHandler)
  .route("/", updateMediaSuggestionHandler)
  .route("/", withdrawMediaSuggestionHandler)
  .route("/", acceptMediaSuggestionHandler)
  .route("/", rejectMediaSuggestionHandler)
