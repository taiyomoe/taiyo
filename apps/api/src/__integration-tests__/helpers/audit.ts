import { type Json, sql } from "@taiyomoe/db"
import type { Services } from "../../services"

export const findAuditLogs = ({ db }: Services, action: string) =>
  db
    .selectFrom("auditLogs")
    .selectAll()
    .where("action", "=", action)
    .orderBy("createdAt", "asc")
    .execute()

type SeedAuditLog = {
  action: string
  outcome?: "success" | "failure" | "denied"
  severity?: "low" | "medium" | "high" | "critical"
  actorId?: string
  actorType?: "user" | "system"
  target?: { type: string; id: string; [key: string]: unknown }
  reason?: string
  ip?: string
  status?: number
  changes?: { before?: unknown; after?: unknown }
  at?: string
}

export const seedAuditLogs = async ({ db }: Services, logs: SeedAuditLog[]) => {
  for (const log of logs) {
    const at = log.at ?? new Date().toISOString()
    const outcome = log.outcome ?? "success"
    const actor = { type: log.actorType ?? "user", id: log.actorId ?? "anonymous" }

    await db
      .insertInto("auditLogs")
      .values({
        createdAt: sql<Date>`(${at}::timestamptz at time zone 'UTC')`,
        action: log.action,
        outcome,
        severity: log.severity ?? "medium",
        actorType: actor.type,
        actorId: actor.id,
        targetType: log.target?.type ?? null,
        targetId: log.target?.id ?? null,
        reason: log.reason ?? null,
        ip: log.ip ?? null,
        event: sql<Json>`${JSON.stringify({
          timestamp: at,
          method: "POST",
          path: "/seeded",
          status: log.status ?? 200,
          audit: {
            action: log.action,
            actor,
            outcome,
            ...(log.target === undefined ? {} : { target: log.target }),
            ...(log.reason === undefined ? {} : { reason: log.reason }),
            ...(log.changes === undefined ? {} : { changes: log.changes }),
          },
        })}::jsonb`,
      })
      .execute()
  }
}
