import type { ColumnType } from "kysely"

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export type JsonPrimitive = boolean | number | string | null

export type JsonObject = { [x: string]: JsonValue | undefined }

export type JsonArray = JsonValue[]

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Json = JsonValue

export type ArrayType<T> =
  T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S[], I[], U[]> : T[]
