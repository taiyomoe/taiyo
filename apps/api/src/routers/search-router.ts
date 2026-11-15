import { Hono } from "hono"
import { quickSearchHandler } from "../handlers/quick-search-handler"

export const searchRouter = new Hono().route("/", quickSearchHandler)
