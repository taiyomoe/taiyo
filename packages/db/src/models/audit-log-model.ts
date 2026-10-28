import type { Insertable } from "kysely"
import type { AuditActorType, AuditOutcome, AuditSeverity } from "../constants"
import type { Generated, Json, Timestamp } from "../types"

export type AuditLog = {
  id: Generated<string>
  createdAt: Timestamp
  action: string
  outcome: AuditOutcome
  severity: AuditSeverity | null
  actorType: AuditActorType
  actorId: string
  targetType: string | null
  targetId: string | null
  reason: string | null
  requestId: string | null
  ip: string | null
  userAgent: string | null
  idempotencyKey: string | null
  event: Json
}

export type NewAuditLog = Insertable<AuditLog>
