import { getWinstonTransport, init } from "@hyperdx/node-opentelemetry"
import { config } from "@taiyomoe/config"
import winston from "winston"
import { env } from "./env"

init({
  apiKey: env.HYPERDX_INGESTION_KEY,
  service: "taiyomoe",
})

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    getWinstonTransport(config.logger.defaultLevel, {
      detectResources: true,
      sendIntervalMs: config.logger.minimumIntervalInMs,
    }),
  ],
})
