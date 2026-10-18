import type { AuditChanges, AuditTarget } from "evlog"
import { KQL_MAX_LENGTH } from "@taiyomoe/audit/query"
import {
  AUDIT_ACTOR_TYPES,
  AUDIT_OUTCOMES,
  AUDIT_SEVERITIES,
  type DB,
  type Kysely,
  type RawBuilder,
  sql,
  type SqlBool,
} from "@taiyomoe/db"
import z from "zod"
import { type AuditLogQueryError, compileAuditLogQuery } from "./audit-log-query"

const filterField = (description: string) =>
  z.string().min(1).max(200).optional().meta({ description })

export const auditLogFilterSchema = z.object({
  q: z.string().max(KQL_MAX_LENGTH, { error: "The query is too long." }).optional().meta({
    description:
      "A KQL query, e.g. `category: media and not outcome: success`. Fields: action, category, outcome, severity, actor, actor.id, actor.type, actor.impersonating, target, target.type, target.<field>, changed, reason, ip, userAgent, requestId, method, path, status, timestamp, id.",
    example: "actor: admin and severity >= high",
  }),
  actorId: filterField("Only entries performed by this actor (a user id, `anonymous`, or a job)."),
  actorType: z.enum(AUDIT_ACTOR_TYPES).optional().meta({ description: "Only this kind of actor." }),
  action: filterField("Only entries with this exact action, e.g. `media.CREATE`."),
  actionPrefix: filterField("Only entries whose action starts with this, e.g. `media.`."),
  targetType: filterField("Only entries performed on this kind of resource, e.g. `media`."),
  targetId: filterField("Only entries performed on the resource with this id."),
  outcome: z.enum(AUDIT_OUTCOMES).optional().meta({ description: "Only this outcome." }),
  severity: z.enum(AUDIT_SEVERITIES).optional().meta({ description: "Only this severity." }),
  from: z.iso.datetime().optional().meta({ description: "Only entries recorded at or after." }),
  to: z.iso.datetime().optional().meta({ description: "Only entries recorded before." }),
})

export type AuditLogFilters = z.output<typeof auditLogFilterSchema>

const toUtcTimestamp = (iso: string) => sql<Date>`(${iso}::timestamptz at time zone 'UTC')`

export const toIsoString = (timestamp: RawBuilder<unknown>) =>
  sql<string>`to_char(${timestamp}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`

export const toQueryIssues = ({ message, start, end }: AuditLogQueryError) => [
  { code: "invalid_query", path: ["q"], message, start, end },
]

export const auditLogSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the audit log entry." }),
  createdAt: z.iso.datetime().meta({ description: "When the action was recorded." }),
  action: z.string().meta({ description: "What was done.", example: "media.CREATE" }),
  outcome: z
    .enum(AUDIT_OUTCOMES)
    .meta({ description: "Whether the action succeeded, failed, or was denied." }),
  severity: z
    .enum(AUDIT_SEVERITIES)
    .nullable()
    .meta({ description: "How sensitive the action is." }),
  actor: z.object({
    type: z.enum(AUDIT_ACTOR_TYPES).meta({ description: "Who performed the action." }),
    id: z.string().meta({
      description: "A user id, `anonymous` for signed-out visitors, or the name of a system job.",
    }),
    displayName: z
      .string()
      .nullable()
      .meta({ description: "The actor's display name when the action was recorded." }),
    impersonating: z
      .string()
      .nullable()
      .meta({ description: "The user an admin was impersonating, if any." }),
    user: z
      .object({
        id: z.uuid(),
        username: z.string(),
        displayUsername: z.string(),
        image: z.string().nullable(),
      })
      .nullable()
      .meta({ description: "The actor's current account, when the actor is an existing user." }),
  }),
  target: z.looseObject({ type: z.string(), id: z.string() }).nullable().meta({
    description: "The resource the action was performed on, with action-specific fields.",
  }),
  reason: z
    .string()
    .nullable()
    .meta({ description: "The error code of a failed or denied action, or the stated reason." }),
  changes: z
    .object({
      before: z.unknown().optional(),
      after: z.unknown().optional(),
      patch: z
        .object({
          op: z.enum(["add", "remove", "replace"]),
          path: z.string(),
          value: z.unknown().optional(),
        })
        .array()
        .optional(),
    })
    .nullable()
    .meta({ description: "The changed fields of an update, before and after." }),
  context: z.object({
    requestId: z.string().nullable(),
    ip: z.string().nullable(),
    userAgent: z.string().nullable(),
  }),
  request: z
    .object({
      method: z.string(),
      path: z.string(),
      status: z.number().nullable(),
      duration: z.string().nullable(),
    })
    .nullable()
    .meta({ description: "The HTTP request that performed the action, if any." }),
  preview: z
    .object({
      kind: z.enum(["media", "group", "staff", "user"]),
      id: z.uuid(),
      label: z.string().nullable(),
      image: z.url().nullable(),
    })
    .nullable()
    .meta({
      description:
        "The media, group, staff member or user the entry is about, with its cover, logo, photo or avatar, for display.",
    }),
})

export const fromAuditLogs = (db: Kysely<DB>) =>
  db
    .selectFrom("auditLogs")
    .leftJoin("users", (join) =>
      join.on(sql<boolean>`${sql.ref("users.id")}::text = ${sql.ref("auditLogs.actorId")}`),
    )

export const filterAuditLogs = (
  query: ReturnType<typeof fromAuditLogs>,
  filters: AuditLogFilters,
) => {
  const compiled = filters.q === undefined ? null : compileAuditLogQuery(filters.q)
  const equals = (column: string, value: string | undefined) =>
    value === undefined ? [] : [sql<SqlBool>`${sql.ref(column)} = ${value}`]
  const conditions: Array<RawBuilder<SqlBool>> = [
    ...(compiled === null ? [] : [compiled]),
    ...equals("auditLogs.actorId", filters.actorId),
    ...equals("auditLogs.actorType", filters.actorType),
    ...equals("auditLogs.action", filters.action),
    ...equals("auditLogs.targetType", filters.targetType),
    ...equals("auditLogs.targetId", filters.targetId),
    ...equals("auditLogs.outcome", filters.outcome),
    ...equals("auditLogs.severity", filters.severity),
    ...(filters.actionPrefix === undefined
      ? []
      : [sql<SqlBool>`${sql.ref("auditLogs.action")} ^@ ${filters.actionPrefix}`]),
    ...(filters.from === undefined
      ? []
      : [sql<SqlBool>`${sql.ref("auditLogs.createdAt")} >= ${toUtcTimestamp(filters.from)}`]),
    ...(filters.to === undefined
      ? []
      : [sql<SqlBool>`${sql.ref("auditLogs.createdAt")} < ${toUtcTimestamp(filters.to)}`]),
  ]

  return conditions.length === 0
    ? query
    : query.where(sql<SqlBool>`${sql.join(conditions, sql` and `)}`)
}

export const selectAuditLogs = (query: ReturnType<typeof fromAuditLogs>) =>
  query.select([
    "auditLogs.id",
    toIsoString(sql.ref("auditLogs.createdAt")).as("createdAt"),
    "auditLogs.action",
    "auditLogs.outcome",
    "auditLogs.severity",
    "auditLogs.actorType",
    "auditLogs.actorId",
    "auditLogs.reason",
    "auditLogs.requestId",
    "auditLogs.ip",
    "auditLogs.userAgent",
    "users.username as actorUsername",
    "users.displayUsername as actorDisplayUsername",
    "users.image as actorImage",
    sql<string | null>`"auditLogs".event->'audit'->'actor'->>'displayName'`.as("actorDisplayName"),
    sql<string | null>`"auditLogs".event->'audit'->'actor'->>'impersonating'`.as(
      "actorImpersonating",
    ),
    sql<AuditTarget | null>`"auditLogs".event->'audit'->'target'`.as("target"),
    sql<AuditChanges | null>`"auditLogs".event->'audit'->'changes'`.as("changes"),
    sql<string | null>`"auditLogs".event->>'method'`.as("method"),
    sql<string | null>`"auditLogs".event->>'path'`.as("path"),
    sql<number | null>`("auditLogs".event->>'status')::int`.as("status"),
    sql<string | null>`"auditLogs".event->>'duration'`.as("duration"),
  ])

type AuditLogRow = Awaited<ReturnType<ReturnType<typeof selectAuditLogs>["execute"]>>[number]

export const toAuditLog = (row: AuditLogRow) => ({
  id: row.id,
  createdAt: row.createdAt,
  action: row.action,
  outcome: row.outcome,
  severity: row.severity,
  actor: {
    type: row.actorType,
    id: row.actorId,
    displayName: row.actorDisplayName,
    impersonating: row.actorImpersonating,
    user:
      row.actorUsername === null || row.actorDisplayUsername === null
        ? null
        : {
            id: row.actorId,
            username: row.actorUsername,
            displayUsername: row.actorDisplayUsername,
            image: row.actorImage,
          },
  },
  target: row.target,
  reason: row.reason,
  changes: row.changes,
  context: { requestId: row.requestId, ip: row.ip, userAgent: row.userAgent },
  request:
    row.method === null || row.path === null
      ? null
      : { method: row.method, path: row.path, status: row.status, duration: row.duration },
})
