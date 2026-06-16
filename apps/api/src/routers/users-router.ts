import { Hono } from "hono"
import { createListHandler } from "../handlers/create-list-handler"
import { deleteChapterHistoryHandler } from "../handlers/delete-chapter-history-handler"
import { followUserHandler } from "../handlers/follow-user-handler"
import { listFollowersHandler } from "../handlers/list-followers-handler"
import { listFollowingHandler } from "../handlers/list-following-handler"
import { listMyHistoryHandler } from "../handlers/list-my-history-handler"
import { listMyLibraryHandler } from "../handlers/list-my-library-handler"
import { listMyListsHandler } from "../handlers/list-my-lists-handler"
import { removeLibraryEntryHandler } from "../handlers/remove-library-entry-handler"
import { unfollowUserHandler } from "../handlers/unfollow-user-handler"
import { upsertLibraryEntryHandler } from "../handlers/upsert-library-entry-handler"

export const usersRouter = new Hono()
  .route("/", followUserHandler)
  .route("/", unfollowUserHandler)
  .route("/", listFollowersHandler)
  .route("/", listFollowingHandler)
  .route("/", listMyHistoryHandler)
  .route("/", deleteChapterHistoryHandler)
  .route("/", upsertLibraryEntryHandler)
  .route("/", removeLibraryEntryHandler)
  .route("/", listMyLibraryHandler)
  .route("/", createListHandler)
  .route("/", listMyListsHandler)
