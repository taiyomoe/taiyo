export type AuditLogFieldType = "keyword" | "text" | "enum" | "number" | "date"

export type AuditLogField = {
  name: string
  type: AuditLogFieldType
  description: string
  values?: readonly string[]
  range?: boolean
  suggest?: boolean
}

export const AUDIT_LOG_OUTCOMES = ["success", "failure", "denied"] as const

export const AUDIT_LOG_SEVERITIES = ["low", "medium", "high", "critical"] as const

export const AUDIT_LOG_ACTOR_TYPES = ["user", "system", "api", "agent"] as const

export const AUDIT_LOG_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const

export const AUDIT_LOG_FIELDS: readonly AuditLogField[] = [
  {
    name: "action",
    type: "keyword",
    description: "What was done, e.g. media.CREATE",
    suggest: true,
  },
  {
    name: "category",
    type: "keyword",
    description: "The area of the action, e.g. media or auth",
    suggest: true,
  },
  {
    name: "outcome",
    type: "enum",
    description: "Whether it succeeded, failed or was denied",
    values: AUDIT_LOG_OUTCOMES,
  },
  {
    name: "severity",
    type: "enum",
    description: "How sensitive the action is, from low to critical",
    values: AUDIT_LOG_SEVERITIES,
    range: true,
  },
  {
    name: "actor",
    type: "keyword",
    description: "Who did it: a username, display name or id",
    suggest: true,
  },
  { name: "actor.id", type: "keyword", description: "The actor's exact id", suggest: true },
  {
    name: "actor.type",
    type: "enum",
    description: "user, system, api or agent",
    values: AUDIT_LOG_ACTOR_TYPES,
  },
  {
    name: "actor.impersonating",
    type: "keyword",
    description: "The user an admin was impersonating",
  },
  { name: "target", type: "keyword", description: "The id of the affected resource" },
  {
    name: "target.type",
    type: "keyword",
    description: "The kind of resource, e.g. media or user",
    suggest: true,
  },
  { name: "target.id", type: "keyword", description: "The id of the affected resource" },
  {
    name: "changed",
    type: "keyword",
    description: "A field an update changed, e.g. role",
    suggest: true,
  },
  {
    name: "reason",
    type: "text",
    description: "The error code, or the reason given",
    suggest: true,
  },
  { name: "ip", type: "keyword", description: "The IP address of the request", suggest: true },
  { name: "userAgent", type: "text", description: "The browser or client that sent it" },
  { name: "requestId", type: "keyword", description: "The id of the HTTP request" },
  { name: "method", type: "enum", description: "The HTTP method", values: AUDIT_LOG_METHODS },
  { name: "path", type: "keyword", description: "The HTTP path", suggest: true },
  { name: "status", type: "number", description: "The HTTP status code", range: true },
  { name: "timestamp", type: "date", description: "When it happened", range: true },
  { name: "id", type: "keyword", description: "The id of the audit log entry" },
]

const FIELD_ALIASES: Record<string, string> = {
  user: "actor",
  "@timestamp": "timestamp",
  time: "timestamp",
}
const TARGET_EXTRA_FIELD = /^target\.[A-Za-z][A-Za-z0-9_]{0,63}$/
const fieldsByName = new Map(AUDIT_LOG_FIELDS.map((field) => [field.name, field]))

export const getAuditLogField = (name: string): AuditLogField | undefined => {
  const canonical = FIELD_ALIASES[name] ?? name
  const known = fieldsByName.get(canonical)

  if (known !== undefined) {
    return known
  }

  return TARGET_EXTRA_FIELD.test(canonical)
    ? { name: canonical, type: "keyword", description: "A field of the affected resource" }
    : undefined
}
