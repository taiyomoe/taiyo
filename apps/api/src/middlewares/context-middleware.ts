import type { S3Client } from "@aws-sdk/client-s3"
import type { Auth, Session, User } from "@taiyomoe/auth/server"
import type { DB } from "@taiyomoe/db"
import type { Actor, Permissions } from "@taiyomoe/permissions"
import type { ChapterUploadProducer } from "@taiyomoe/queue"
import type { Meilisearch } from "@taiyomoe/search"
import type { EvlogVariables } from "evlog/hono"
import type { TypedResponse } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import type { JSONParsed } from "hono/utils/types"
import type { Kysely } from "kysely"
import type { Mailer } from "../services"
import type { ErrorCode, errors } from "../utils/errors"

export type SuccessEnvelope<T> = {
  success: true
  data: T
  timestamp: string
  requestId: string
}

export type PaginatedEnvelope<T, M> = SuccessEnvelope<T> & { meta: M }

type ErrorEnvelope<C extends ErrorCode = ErrorCode> = {
  success: false
  code: C
  message: string
  timestamp: string
  requestId: string
  details?: unknown
}

type ErrorStatus<C extends ErrorCode> = Extract<(typeof errors)[C]["code"], ContentfulStatusCode>

export type JsonResponse<T, S extends ContentfulStatusCode> = Response &
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
  actor?: Actor
  can?: Permissions
  chapterUploadQueue: ChapterUploadProducer
  mailer: Mailer
  cacheNamespace: string
}
