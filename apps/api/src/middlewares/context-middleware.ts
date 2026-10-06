import type { S3Client } from "@aws-sdk/client-s3"
import type { TypedResponse } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import type { JSONParsed } from "hono/utils/types"
import type { Auth, Session, User } from "@taiyomoe/auth/server"
import type { ChapterUploadProducer } from "@taiyomoe/queue"
import type { DB } from "@taiyomoe/db"
import type { Meilisearch } from "@taiyomoe/search"
import { EvlogVariables } from "evlog/hono"
import { createMiddleware } from "hono/factory"
import type { Kysely } from "kysely"
import type { Services } from "../services"
import { type ErrorCode, errors } from "../utils/errors"

type SuccessEnvelope<T> = {
  success: true
  data: T
  timestamp: string
  requestId: string
}

type PaginatedEnvelope<T, M> = SuccessEnvelope<T> & { meta: M }

type ErrorEnvelope<C extends ErrorCode = ErrorCode> = {
  success: false
  code: C
  message: string
  timestamp: string
  requestId: string
  details?: unknown
}

type ErrorStatus<C extends ErrorCode> = Extract<(typeof errors)[C]["code"], ContentfulStatusCode>

type JsonResponse<T, S extends ContentfulStatusCode> = Response &
  TypedResponse<JSONParsed<T>, S, "json">

export type AppContext = {
  ok: {
    <T>(data: T): JsonResponse<SuccessEnvelope<T>, 200 | 201>
    <T, M extends Record<string, unknown>>(
      data: T,
      meta: M,
    ): JsonResponse<PaginatedEnvelope<T, M>, 200 | 201>
  }
  fail: <C extends ErrorCode>(
    errorCode: C,
    details?: unknown,
  ) => JsonResponse<ErrorEnvelope<C>, ErrorStatus<C>>
}

export type AppContextVariables = EvlogVariables["Variables"] & {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  meili: Meilisearch
  mediasIndex: string
  auth: Auth
  user?: User
  session?: Session["session"]
  chapterUploadQueue: ChapterUploadProducer
}

export const createContextMiddleware = (services: Services) =>
  createMiddleware(async (c, next) => {
    const timestamp = new Date().toISOString()
    const requestId = (c.get("log").getContext().requestId as string) || crypto.randomUUID()

    c.set("db", services.db)
    c.set("s3", services.s3)
    c.set("s3Bucket", services.s3Bucket)
    c.set("meili", services.meili)
    c.set("mediasIndex", services.mediasIndex)
    c.set("auth", services.auth)
    c.set("chapterUploadQueue", services.chapterUploadQueue)

    c.ok = ((data: unknown, meta?: Record<string, unknown>) => {
      c.status(c.req.method === "POST" ? 201 : 200)

      return c.json({
        success: true,
        data,
        ...(meta !== undefined ? { meta } : {}),
        timestamp,
        requestId,
      })
    }) as AppContext["ok"]

    c.fail = ((errorCode: ErrorCode, details?: unknown) => {
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
    }) as AppContext["fail"]

    await next()
  })
