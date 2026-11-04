import {
  type AuditLogField,
  type KqlNode,
  type KqlRangeOperator,
  type KqlValue,
  normalizeEnumValue,
  parseKql,
} from "@taiyomoe/audit/query"
import { type RawBuilder, sql, type SqlBool } from "@taiyomoe/db"

export class AuditLogQueryError extends Error {
  readonly start: number
  readonly end: number

  constructor(message: string, start: number, end: number) {
    super(message)
    this.start = start
    this.end = end
  }
}

type Column = RawBuilder<unknown>

const event = sql.ref("auditLogs.event")
const columns: Record<string, Column> = {
  action: sql`${sql.ref("auditLogs.action")}`,
  category: sql`split_part(${sql.ref("auditLogs.action")}, '.', 1)`,
  outcome: sql`${sql.ref("auditLogs.outcome")}::text`,
  severity: sql`${sql.ref("auditLogs.severity")}::text`,
  "actor.id": sql`${sql.ref("auditLogs.actorId")}`,
  "actor.type": sql`${sql.ref("auditLogs.actorType")}::text`,
  "actor.impersonating": sql`${event}->'audit'->'actor'->>'impersonating'`,
  target: sql`${sql.ref("auditLogs.targetId")}`,
  "target.id": sql`${sql.ref("auditLogs.targetId")}`,
  "target.type": sql`${sql.ref("auditLogs.targetType")}`,
  reason: sql`${sql.ref("auditLogs.reason")}`,
  ip: sql`${sql.ref("auditLogs.ip")}`,
  userAgent: sql`${sql.ref("auditLogs.userAgent")}`,
  requestId: sql`${sql.ref("auditLogs.requestId")}`,
  method: sql`${event}->>'method'`,
  path: sql`${event}->>'path'`,
  status: sql`(${event}->>'status')::int`,
  timestamp: sql`${sql.ref("auditLogs.createdAt")}`,
  id: sql`${sql.ref("auditLogs.id")}::text`,
}
const actorColumns: Column[] = [
  sql`${sql.ref("auditLogs.actorId")}`,
  sql`${sql.ref("users.username")}`,
  sql`${sql.ref("users.displayUsername")}`,
  sql`${event}->'audit'->'actor'->>'displayName'`,
]
const textColumns: Column[] = [
  sql`${sql.ref("auditLogs.action")}`,
  ...actorColumns,
  sql`${sql.ref("auditLogs.targetId")}`,
  sql`${sql.ref("auditLogs.reason")}`,
  sql`${sql.ref("auditLogs.ip")}`,
  sql`${event}->>'path'`,
  sql`(${event}->'audit'->'target')::text`,
]
const anyOf = (conditions: Array<RawBuilder<SqlBool>>) =>
  sql<SqlBool>`(${sql.join(conditions, sql` or `)})`
const allOf = (conditions: Array<RawBuilder<SqlBool>>) =>
  sql<SqlBool>`(${sql.join(conditions, sql` and `)})`
const toPattern = (text: string) =>
  text.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll("*", "%")
const isWildcard = (value: KqlValue) => !value.quoted && value.text.includes("*")
const getColumn = (field: AuditLogField): Column =>
  columns[field.name] ?? sql`${event}->'audit'->'target'->>${field.name.slice("target.".length)}`
const matchText = (column: Column, value: KqlValue, contains: boolean) => {
  if (isWildcard(value)) {
    return sql<SqlBool>`${column} ilike ${toPattern(value.text)}`
  }

  return contains
    ? sql<SqlBool>`${column} ilike ${`%${toPattern(value.text)}%`}`
    : sql<SqlBool>`lower(${column}) = lower(${value.text})`
}
const toEnumValue = (field: AuditLogField, value: KqlValue) => normalizeEnumValue(field, value.text)
const compileMatch = (field: AuditLogField, value: KqlValue): RawBuilder<SqlBool> => {
  if (field.name === "actor") {
    return anyOf(actorColumns.map((column) => matchText(column, value, false)))
  }

  if (field.name === "changed") {
    const key = value.text

    return sql<SqlBool>`(jsonb_exists(${event}->'audit'->'changes'->'after', ${key}) or jsonb_exists(${event}->'audit'->'changes'->'before', ${key}))`
  }

  const column = getColumn(field)

  switch (field.type) {
    case "enum": {
      return isWildcard(value)
        ? matchText(column, value, false)
        : sql<SqlBool>`${column} = ${toEnumValue(field, value)}`
    }

    case "number": {
      return sql<SqlBool>`${column} = ${Number(value.text)}`
    }

    case "date": {
      return sql<SqlBool>`false`
    }

    case "text": {
      return matchText(column, value, true)
    }

    case "keyword":

    default: {
      return matchText(column, value, false)
    }
  }
}
const compileRange = (
  field: AuditLogField,
  operator: KqlRangeOperator,
  value: KqlValue,
): RawBuilder<SqlBool> => {
  const op = sql.raw(operator)

  if (field.name === "severity") {
    return sql<SqlBool>`${sql.ref("auditLogs.severity")} ${op} ${toEnumValue(field, value)}::"AuditSeverity"`
  }

  if (field.type === "date") {
    return sql<SqlBool>`${getColumn(field)} ${op} (${new Date(value.text).toISOString()}::timestamptz at time zone 'UTC')`
  }

  return sql<SqlBool>`${getColumn(field)} ${op} ${Number(value.text)}`
}
const compileNode = (node: KqlNode): RawBuilder<SqlBool> => {
  switch (node.type) {
    case "or": {
      return anyOf(node.children.map(compileNode))
    }

    case "and": {
      return allOf(node.children.map(compileNode))
    }

    case "not": {
      return sql<SqlBool>`not coalesce(${compileNode(node.child)}, false)`
    }

    case "exists": {
      return node.field.name === "changed"
        ? sql<SqlBool>`(${event}->'audit'->'changes') is not null`
        : sql<SqlBool>`${getColumn(node.field)} is not null`
    }

    case "range": {
      return compileRange(node.field, node.operator, node.value)
    }

    case "match": {
      return compileMatch(node.field, node.value)
    }

    case "text":

    default: {
      return anyOf(
        textColumns.map((column) => matchText(column, node.value, !isWildcard(node.value))),
      )
    }
  }
}

export const compileAuditLogQuery = (query: string): RawBuilder<SqlBool> | null => {
  const result = parseKql(query)

  if (!result.ok) {
    throw new AuditLogQueryError(result.error.message, result.error.start, result.error.end)
  }

  return result.node === null ? null : compileNode(result.node)
}
