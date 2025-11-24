import { node } from "@elysiajs/node"
import { fromTypes, openapi } from "@elysiajs/openapi"
import { opentelemetry } from "@elysiajs/opentelemetry"
import HyperDX from "@hyperdx/node-opentelemetry"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node"
import { config } from "@taiyomoe/config"
import { db } from "@taiyomoe/db"
import Elysia from "elysia"
import z from "zod"
import { env } from "./env"
import { logger } from "./utils/logger"

HyperDX.init({
  apiKey: env.HYPERDX_INGESTION_KEY,
  service: config.logger.services.api,
  disableStartupLogs: true,
  disableMetrics: true,
  instrumentations: {
    "@opentelemetry/instrumentation-dns": { enabled: false },
    "@opentelemetry/instrumentation-net": { enabled: false },
  },
})

export const app = new Elysia({ adapter: node() })
  .use(
    opentelemetry({
      serviceName: config.logger.services.api,
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: `${env.HYPERDX_INGESTION_BASE_URL}/v1/traces`,
            headers: { Authorization: env.HYPERDX_INGESTION_KEY },
          }),
        ),
      ],
    }),
  )
  .use(
    openapi({
      references: fromTypes(),
      mapJsonSchema: { zod: z.toJSONSchema },
    }),
  )
  .get("/", async () => {
    logger.info("hello world")

    const user = await db.user.findFirst()
    logger.info(user)
    logger.info("user", user)

    return "Hello Elysia"
  })
  .listen(3001, () => {
    logger.info("Server is running on port 3001")
  })

export type App = typeof app
