import { Hono } from "hono"
import { followUserHandler } from "../handlers/follow-user-handler"
import { listFollowersHandler } from "../handlers/list-followers-handler"
import { listFollowingHandler } from "../handlers/list-following-handler"
import { unfollowUserHandler } from "../handlers/unfollow-user-handler"

export const usersRouter = new Hono()
  .route("/", followUserHandler)
  .route("/", unfollowUserHandler)
  .route("/", listFollowersHandler)
  .route("/", listFollowingHandler)
