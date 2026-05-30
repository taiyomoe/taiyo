import { getWinstonTransport } from "@hyperdx/node-opentelemetry"
import { config } from "@taiyomoe/config"
import { colorize } from "json-colorizer"
import winston from "winston"
import { env } from "./env"

export const format = winston.format.printf(
  ({ level: rawLevel, message, timestamp, ...rawMetadata }) => {
    const level = rawLevel
      .replace("debug", "DEBUG")
      .replace("info", "INFO")
      .replace("warn", "WARN")
      .replace("error", "ERROR")
    const splatSymbol = Object.getOwnPropertySymbols(rawMetadata).find(
      (s) => s.description === "splat",
    )
    const metadata =
      splatSymbol && Array.isArray(rawMetadata[splatSymbol]) ? rawMetadata[splatSymbol][0] : null

    return `${timestamp} ${level}: ${message} ${metadata ? colorize(metadata) : ""}`.trim()
  },
)

export const createLogger = (service: keyof typeof config.logger.services) =>
  winston.createLogger({
    level: "debug",
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
      !process.env.TEST
        ? getWinstonTransport(config.logger.defaultLevel, {
            service,
            baseUrl: `${env.HYPERDX_INGESTION_BASE_URL}/v1/logs`,
            headers: { Authorization: env.HYPERDX_INGESTION_KEY },
            detectResources: true,
            sendIntervalMs: config.logger.minimumIntervalInMs,
          })
        : null,
    ].filter(Boolean),
  })
