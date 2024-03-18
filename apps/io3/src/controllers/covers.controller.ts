import { Elysia } from "elysia"
import { authMiddleware } from "~/middlewares/auth.middleware"

const upload = new Elysia()
  .use(authMiddleware([["mediaCovers", "create"]]))
  .post("/upload", () => "world")

export const coversController = new Elysia({ prefix: "/covers" }).use(upload)
