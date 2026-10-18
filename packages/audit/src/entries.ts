import type { AuditSeverity } from "evlog"
import { auditCatalogs } from "./catalog"

export type AuditActionEntry = {
  readonly action: string
  readonly target: unknown
  readonly severity: AuditSeverity | undefined
}

const isAuditActionEntry = (value: unknown): value is AuditActionEntry =>
  typeof value === "function" && "action" in value && typeof value.action === "string"
const entries = auditCatalogs
  .flatMap((catalog): unknown[] => Object.values(catalog))
  .filter(isAuditActionEntry)
const severities = new Map(entries.map((entry) => [entry.action, entry.severity]))

export const auditActions = entries.map((entry) => entry.action).sort((a, b) => a.localeCompare(b))

export const auditTargetTypes = [
  ...new Set(entries.flatMap((entry) => (typeof entry.target === "string" ? [entry.target] : []))),
].sort((a, b) => a.localeCompare(b))

export const getAuditSeverity = (action: string) => severities.get(action) ?? null
