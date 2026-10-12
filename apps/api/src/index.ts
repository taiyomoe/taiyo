import { serve } from "@hono/node-server"
import { type AppType, createApp } from "./app"
import { env } from "./env"
import { createServices } from "./services"

export { createApp }

export type { AppType }

if ((process.env.TEST ?? "") === "") {
  const app = createApp(createServices())

  serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
    // oxlint-disable-next-line no-console
    console.debug(`Server is running on http://localhost:${port}`)
  })
}
