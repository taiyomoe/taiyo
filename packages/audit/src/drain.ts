import { type DB, type Json, type Kysely, sql } from "@taiyomoe/db"
import { auditOnly, type DrainFn } from "evlog"
import { getAuditSeverity } from "./entries"

export const createAuditLogDrain = (db: Kysely<DB>): DrainFn =>
  auditOnly(
    async ({ event }) => {
      const { audit } = event

      if (audit === undefined) {
        return
      }

      await db
        .insertInto("auditLogs")
        .values({
          createdAt: sql<Date>`(${event.timestamp}::timestamptz at time zone 'UTC')`,
          action: audit.action,
          outcome: audit.outcome,
          severity: getAuditSeverity(audit.action),
          actorType: audit.actor.type,
          actorId: audit.actor.id,
          targetType: audit.target?.type ?? null,
          targetId: audit.target?.id ?? null,
          reason: audit.reason ?? null,
          requestId: audit.context?.requestId ?? null,
          ip: audit.context?.ip ?? null,
          userAgent: audit.context?.userAgent ?? null,
          idempotencyKey: audit.idempotencyKey ?? null,
          event: sql<Json>`${JSON.stringify(event)}::jsonb`,
        })
        .execute()
    },
    { await: true },
  )
