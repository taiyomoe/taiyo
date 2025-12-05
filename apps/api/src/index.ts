import { serve } from "@hono/node-server"
import HyperDX from "@hyperdx/node-opentelemetry"
import { Scalar } from "@scalar/hono-api-reference"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import packageJson from "../package.json"
import { env } from "./env"
import { requestLogger } from "./middlewares/request-logger-middleware"
import { mediasRouter } from "./routers/medias-router"
import { logger } from "./utils/logger"

if (!process.env.TEST) {
  HyperDX.init({
    apiKey: env.HYPERDX_INGESTION_KEY,
    service: config.logger.services.api,
    disableStartupLogs: true,
    consoleCapture: false,
    instrumentations: {
      "@opentelemetry/instrumentation-dns": { enabled: false },
      "@opentelemetry/instrumentation-net": { enabled: false },
    },
  })
}

export const app = new Hono()
  .use(requestLogger)
  .get("/ping", (c) => c.json({ version: packageJson.version }))
  .route("/medias", mediasRouter)

app
  .get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: config.openapi.title,
          version: packageJson.version,
          description: config.openapi.description,
        },
      },
    }),
  )
  .get(
    "/docs",
    Scalar({
      theme: "deepSpace",
      url: "/openapi.json",
    }),
  )

if (!process.env.TEST) {
  serve({ fetch: app.fetch, port: 3002 }, ({ port }) => {
    logger.debug(`Server is running on http://localhost:${port}`)
  })
}
