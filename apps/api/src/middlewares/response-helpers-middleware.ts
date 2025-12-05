import type { MiddlewareHandler } from "hono"
import { type ErrorCode, errors } from "../utils/errors"

export type ResponseHelpers = {
  ok: <T>(data: T) => Response
  fail: (errorCode: ErrorCode, details?: unknown) => Response
}

export const responseHelpers: MiddlewareHandler = async (c, next) => {
  const timestamp = new Date().toISOString()
  const requestId = c.req.header("x-request-id") || crypto.randomUUID()

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
}
