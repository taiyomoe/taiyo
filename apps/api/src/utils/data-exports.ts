import type { DB, Kysely } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { DATA_EXPORT_STATUSES } from "@taiyomoe/db"
import z from "zod"

const COOLDOWN_MS = config.dataExports.cooldownHours * 60 * 60 * 1000

export const dataExportSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the export." }),
  status: z.enum(DATA_EXPORT_STATUSES).meta({
    description:
      "Where the export stands: `PENDING` while the archive is being prepared, `READY` once you can download it, `FAILED` when it could not be prepared, `EXPIRED` once the archive was deleted.",
    example: "READY",
  }),
  requestedAt: z.iso.datetime().meta({ description: "When you asked for the export." }),
  finishedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the archive was ready or the export failed, if any." }),
  expiresAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the archive is deleted, once it is ready." }),
  byteSize: z.int().nonnegative().nullable().meta({
    description: "The size of the archive in bytes, once it is ready.",
    example: 482_113,
  }),
})

export const dataExportStateSchema = z.object({
  latest: dataExportSchema
    .nullable()
    .meta({ description: "Your most recent export, or null if you never asked for one." }),
  nextRequestAt: z.iso.datetime().nullable().meta({
    description:
      "When you can ask for another export, or null if you can now. Failed exports do not count.",
  }),
})

type DataExportRow = {
  id: string
  status: (typeof DATA_EXPORT_STATUSES)[number]
  createdAt: Date
  finishedAt: Date | null
  expiresAt: Date | null
  byteSize: string | null
}

/** An archive past its expiry reads as expired before the worker gets to delete it. */
const isExpired = (row: DataExportRow, now: Date) =>
  row.status === "EXPIRED" || (row.status === "READY" && (row.expiresAt ?? now) <= now)

export const toDataExport = (row: DataExportRow, now = new Date()) => ({
  id: row.id,
  status: isExpired(row, now) ? ("EXPIRED" as const) : row.status,
  requestedAt: row.createdAt.toISOString(),
  finishedAt: row.finishedAt?.toISOString() ?? null,
  expiresAt: row.expiresAt?.toISOString() ?? null,
  byteSize: row.byteSize === null ? null : Number(row.byteSize),
})

const selectExports = (db: Kysely<DB>, userId: string) =>
  db
    .selectFrom("dataExports")
    .select(["id", "status", "createdAt", "finishedAt", "expiresAt", "byteSize"])
    .where("userId", "=", userId)
    .orderBy("createdAt", "desc")
    .limit(1)

/** When the user may ask for another export: a day after the last one that did not fail. */
export const getNextDataExportAt = async (db: Kysely<DB>, userId: string, now = new Date()) => {
  const last = await selectExports(db, userId).where("status", "!=", "FAILED").executeTakeFirst()
  const next = last === undefined ? null : new Date(last.createdAt.getTime() + COOLDOWN_MS)

  return next === null || next <= now ? null : next
}

export const getDataExportState = async (db: Kysely<DB>, userId: string) => {
  const now = new Date()
  const [latest, nextRequestAt] = await Promise.all([
    selectExports(db, userId).executeTakeFirst(),
    getNextDataExportAt(db, userId, now),
  ])

  return {
    latest: latest === undefined ? null : toDataExport(latest, now),
    nextRequestAt: nextRequestAt?.toISOString() ?? null,
  }
}
