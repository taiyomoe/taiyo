import type { Session, User } from "@taiyomoe/auth/server"
import { type DB, db } from "@taiyomoe/db"
import { s3Client } from "@taiyomoe/s3"
import { EvlogVariables } from "evlog/hono"
import { createMiddleware } from "hono/factory"
import type { Kysely } from "kysely"
import { type ErrorCode, errors } from "../utils/errors"

export type AppContext = {
  ok: <T>(data: T, meta?: Record<string, unknown>) => Response
  fail: (errorCode: ErrorCode, details?: unknown) => Response
}

export type AppContextVariables = EvlogVariables["Variables"] & {
  db: Kysely<DB>
  s3: typeof s3Client
  user?: User
  session?: Session["session"]
}

export const contextMiddleware = createMiddleware(async (c, next) => {
  const timestamp = new Date().toISOString()
  const requestId = (c.get("log").getContext().requestId as string) || crypto.randomUUID()

  c.set("db", db)
  c.set("s3", s3Client)

  c.ok = <T>(data: T, meta?: Record<string, unknown>) => {
    c.status(c.req.method === "POST" ? 201 : 200)

    return c.json({
      success: true,
      data,
      ...(meta !== undefined ? { meta } : {}),
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
