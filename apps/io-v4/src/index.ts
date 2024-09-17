import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { chaptersController } from "./controllers/chapters.controller"
import { withHelpers } from "./middlewares/withHelpers"

const app = new Hono()
  .use(cors())
  .use(withHelpers)
  .route("/chapters", chaptersController)

console.log("Server is running on port 4000")

serve({
  fetch: app.fetch,
  port: 4000,
})
