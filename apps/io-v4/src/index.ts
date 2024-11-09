import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { chaptersController } from "~/controllers/chapters.controller"
import { withHelpers } from "~/middlewares/helpers.middleware"
import { formatError } from "~/utils/format-error"
import { HttpError } from "~/utils/http-error"

const app = new Hono()
  .use(cors())
  .use(withHelpers)
  .route("/chapters", chaptersController)
  .onError((e, c) => {
    if (e instanceof HttpError) {
      c.status(e.status)
      return formatError(e.i18nKey)(c)
    }

    console.error(e)

    c.status(500)
    return formatError("unexpected")(c)
  })
  .notFound(formatError("notFound"))

console.log("Server is running on port 4100")

serve({
  fetch: app.fetch,
  port: 4100,
})
