import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { withInternationalization } from "./middlewares/withInternationalization"

const app = new Hono().use(withInternationalization)

console.log("Server is running on port 4000")

serve({
  fetch: app.fetch,
  port: 4000,
})
