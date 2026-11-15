import type { ColumnType } from "kysely"

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

type JsonPrimitive = boolean | number | string | null

type JsonObject = {
  [x: string]: JsonValue | undefined
}

type JsonArray = JsonValue[]

type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Json = JsonValue

export type ArrayType<T> =
  T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S[], I[], U[]> : T[]
