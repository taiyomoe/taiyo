import { config } from "@taiyomoe/config"
import { type ChapterStatus, sql } from "@taiyomoe/db"
import z from "zod"

const NOW_UTC = sql<Date>`(CURRENT_TIMESTAMP at time zone 'UTC')`

export const publishAtSchema = z.iso.datetime().nullable().exactOptional().meta({
  description:
    "When the chapter goes live. Null, or a time already past, means as soon as it is ready.",
  example: "2026-11-01T18:00:00.000Z",
})

export const externalUrlSchema = z
  .url({ protocol: /^https?$/ })
  .max(config.input.maxUrlLength)
  .nullable()
  .exactOptional()
  .meta({
    description: "Link to the chapter on the group's own site.",
    example: "https://sunray-scans.com/boruto/112",
  })

export const isFuture = (iso: string | null | undefined) =>
  iso !== null && iso !== undefined && new Date(iso).getTime() > Date.now()

export const toPublishAt = (iso: string | null) =>
  iso === null ? null : sql<Date>`${iso}::timestamptz at time zone 'UTC'`

export const publishAtIso = sql<
  string | null
>`to_char("chapters"."publishAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`

export const readyStatus = sql<ChapterStatus>`case when "publishAt" > ${NOW_UTC} then 'SCHEDULED'::"ChapterStatus" else 'PUBLISHED'::"ChapterStatus" end`

export const readyCreatedAt = sql<Date>`case when "publishAt" > ${NOW_UTC} then "createdAt" else CURRENT_TIMESTAMP end`

export const hasContent = sql<boolean>`("chapters"."isExternal" or coalesce(cardinality("chapters"."pages"), 0) > 0)`
