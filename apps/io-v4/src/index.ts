import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { chaptersController } from "./controllers/chapters.controller"
import { mediasController } from "./controllers/medias.controller"
import { withHelpers } from "./middlewares/withHelpers"
import { formatError } from "./utils/format-error"

const app = new Hono()
  .use(cors())
  .use(withHelpers)
  .route("/medias", mediasController)
  .route("/chapters", chaptersController)
  .notFound(formatError("notFound"))

console.log("Server is running on port 4000")

serve({
  fetch: app.fetch,
  port: 4000,
})
