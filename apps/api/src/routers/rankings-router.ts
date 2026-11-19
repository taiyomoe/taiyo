import { Hono } from "hono"
import { getGroupsRankingHandler } from "../handlers/get-groups-ranking-handler"
import { getMediasRankingHandler } from "../handlers/get-medias-ranking-handler"
import { getReadersRankingHandler } from "../handlers/get-readers-ranking-handler"

export const rankingsRouter = new Hono()
  .route("/", getReadersRankingHandler)
  .route("/", getGroupsRankingHandler)
  .route("/", getMediasRankingHandler)
