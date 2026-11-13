import { Hono } from "hono"
import { createRecommendationEventHandler } from "../handlers/create-recommendation-event-handler"

export const recommendationsRouter = new Hono().route("/", createRecommendationEventHandler)
