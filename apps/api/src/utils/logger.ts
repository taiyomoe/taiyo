import { getWinstonTransport } from "@hyperdx/node-opentelemetry"
import { config } from "@taiyomoe/config"
import winston from "winston"
import { env } from "../env"

const format = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const messageStr =
      typeof message === "object" && message !== null
        ? JSON.stringify(message, null, 2)
        : message

    const metadataKeys = Object.keys(metadata).filter(
      (key) => !["splat", "Symbol(level)", "Symbol(message)"].includes(key),
    )

    const metadataStr =
      metadataKeys.length > 0
        ? JSON.stringify(
            Object.fromEntries(metadataKeys.map((key) => [key, metadata[key]])),
            null,
            2,
          )
        : ""

    return `${timestamp} ${level}: ${messageStr} ${metadataStr}`.trim()
  },
)

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YY-MM-DD HH:mm:ss.SSS" }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        format,
      ),
    }),
    getWinstonTransport(config.logger.defaultLevel, {
      service: config.logger.services.api,
      baseUrl: `${env.HYPERDX_INGESTION_BASE_URL}/v1/logs`,
      headers: { Authorization: env.HYPERDX_INGESTION_KEY },
      detectResources: true,
      sendIntervalMs: config.logger.minimumIntervalInMs,
    }),
  ],
})
