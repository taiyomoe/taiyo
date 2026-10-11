import { serve } from "@hono/node-server"
import { createApp } from "./app"
import { env } from "./env"
import { createServices } from "./services"

export { createApp } from "./app"

export type { AppType } from "./app"

if (!process.env.TEST) {
  const app = createApp(createServices())

  serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
    // oxlint-disable-next-line no-console
    console.debug(`Server is running on http://localhost:${port}`)
  })
}
