import { Hono } from "hono"
import type { Context } from "../types"

export const chaptersController = new Hono<Context>()

chaptersController.post("/", (c) => {
  return c.text(c.var.t("medias.notFound", { name: "taiyo" }))
})
