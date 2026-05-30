import { type DB, db } from "@taiyomoe/db"
import { s3Client } from "@taiyomoe/s3"
import { createMiddleware } from "hono/factory"
import type { Kysely } from "kysely"
import { type ErrorCode, errors } from "../utils/errors"
import { logger } from "../utils/logger"

export type AppContext = {
  db: Kysely<DB>
  logger: typeof logger
  s3: typeof s3Client
  ok: <T>(data: T) => Response
  fail: (errorCode: ErrorCode, details?: unknown) => Response
}

export const contextMiddleware = createMiddleware(async (c, next) => {
  const timestamp = new Date().toISOString()
  const requestId = c.req.header("x-request-id") || crypto.randomUUID()

  c.set("db", db)
  c.set("logger", logger)
  c.set("s3", s3Client)

  c.ok = <T>(data: T) => {
    c.status(c.req.method === "POST" ? 201 : 200)

    return c.json({
      success: true,
      data,
      timestamp,
      requestId,
    })
  }

  c.fail = (errorCode: ErrorCode, details?: unknown) => {
    const error = errors[errorCode]

    c.status(error.code)

    const response: {
      success: false
      message: string
      code: ErrorCode
      timestamp: string
      requestId: string
      details?: unknown
    } = {
      success: false,
      code: errorCode,
      message: error.message,
      timestamp,
      requestId,
    }

    if (details !== undefined) {
      response.details = details
    }

    return c.json(response)
  }

  await next()
})
