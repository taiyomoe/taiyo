import type { AuditSeverity } from "evlog"
import { auditCatalogs } from "./catalog"

export type AuditActionEntry = {
  readonly action: string
  readonly target: unknown
  readonly severity: AuditSeverity | undefined
}

const isAuditActionEntry = (value: unknown): value is AuditActionEntry =>
  typeof value === "function" && "action" in value && typeof value.action === "string"
const severities = new Map(
  auditCatalogs
    .flatMap((catalog): unknown[] => Object.values(catalog))
    .filter(isAuditActionEntry)
    .map((entry) => [entry.action, entry.severity]),
)

export const getAuditSeverity = (action: string) => severities.get(action) ?? null
