import { node } from "@elysiajs/node"
import { fromTypes, openapi } from "@elysiajs/openapi"
import HyperDX from "@hyperdx/node-opentelemetry"
import { config } from "@taiyomoe/config"
import "@types/global-types"
import Elysia, { env } from "elysia"
import z from "zod"
import packageJson from "../package.json"
import { mediasRouter } from "./routers/medias-router"
import { logger } from "./utils/logger"

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

export const app = new Elysia({ adapter: node() })
  .use(
    openapi({
      references: fromTypes(),
      mapJsonSchema: { zod: z.toJSONSchema },
    }),
  )
  .onRequest(({ request }) => {
    const url = new URL(request.url)

    logger.debug(`-> ${request.method} ${url.pathname}${url.search}`)
  })
  .onAfterResponse(({ request, set, status }) => {
    const url = new URL(request.url)
    const statusCode = set.status ? status(set.status).code : 500
    const color =
      statusCode >= 200 && statusCode < 300 ? "\x1b[32m" : "\x1b[31m" // green for OK, red for others
    const reset = "\x1b[0m"

    logger.debug(
      `<- ${color}${set.status}${reset} ${request.method} ${url.pathname}${url.search}`,
    )
  })
  .get("/ping", () => ({ version: packageJson.version }))
  .use(mediasRouter)
  .listen(3001, () => {
    logger.debug("Server is running on port 3001")
  })

export type App = typeof app
