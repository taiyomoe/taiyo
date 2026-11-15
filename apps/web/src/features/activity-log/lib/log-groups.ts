import type { AuditLogEntry, AuditLogScope } from "@/features/activity-log/api/audit-logs"
import { andClauses, matchClause } from "@/features/activity-log/lib/kql-query"

export type LogGroup = {
  count: number
  first: string
  last: string
  targets: number
  entry: AuditLogEntry
}

export const toSingleGroup = (entry: AuditLogEntry) =>
  ({
    count: 1,
    first: entry.createdAt,
    last: entry.createdAt,
    targets: entry.target === null ? 0 : 1,
    entry,
  }) satisfies LogGroup

const getGroupClauses = ({ entry }: LogGroup) => [
  matchClause("actor.id", entry.actor.id),
  matchClause("action", entry.action),
  matchClause("outcome", entry.outcome),
  ...(entry.actor.id === "anonymous"
    ? [entry.context.ip === null ? "not ip: *" : matchClause("ip", entry.context.ip)]
    : []),
]

export const getGroupRange = ({ first, last }: LogGroup) => ({
  from: first,
  to: new Date(new Date(last).getTime() + 1).toISOString(),
})

export const getGroupScope = (scope: AuditLogScope, group: LogGroup) =>
  ({
    q: andClauses(scope.q, getGroupClauses(group)),
    ...getGroupRange(group),
  }) satisfies AuditLogScope

export const getGroupViewQuery = (query: string, group: LogGroup) =>
  andClauses(query, getGroupClauses(group))
