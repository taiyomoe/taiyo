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
import { userSummarySchema } from "./schemas"

const filterField = (description: string) =>
  z.string().min(1).max(200).optional().meta({ description })

export const auditLogFilterSchema = z.object({
  q: z.string().max(KQL_MAX_LENGTH, { error: "The query is too long." }).optional().meta({
    description:
      "A KQL query, e.g. `category: media and not outcome: success`. Fields: action, category, outcome, severity, actor, actor.id, actor.type, actor.impersonating, target, target.type, target.<field>, changed, reason, ip, userAgent, requestId, method, path, status, timestamp, id.",
    example: "actor: admin and severity >= high",
  }),
  actorId: filterField(
    "Only entries performed by this actor: a user ID, `anonymous`, or the name of a system job.",
  ),
  actorType: z
    .enum(AUDIT_ACTOR_TYPES)
    .optional()
    .meta({ description: "Only entries performed by this kind of actor.", example: "user" }),
  action: filterField("Only entries with this exact action, e.g. `media.CREATE`."),
  actionPrefix: filterField("Only entries whose action starts with this, e.g. `media.`."),
  targetType: filterField("Only entries performed on this kind of resource, e.g. `media`."),
  targetId: filterField("Only entries performed on the resource with this ID."),
  outcome: z
    .enum(AUDIT_OUTCOMES)
    .optional()
    .meta({ description: "Only entries with this outcome.", example: "denied" }),
  severity: z
    .enum(AUDIT_SEVERITIES)
    .optional()
    .meta({ description: "Only entries with this severity.", example: "high" }),
  from: z.iso
    .datetime()
    .optional()
    .meta({ description: "Only entries recorded at or after this time." }),
  to: z.iso.datetime().optional().meta({ description: "Only entries recorded before this time." }),
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
  outcome: z.enum(AUDIT_OUTCOMES).meta({
    description: "Whether the action succeeded, failed, or was denied.",
    example: "success",
  }),
  severity: z
    .enum(AUDIT_SEVERITIES)
    .nullable()
    .meta({ description: "How sensitive the action is, if rated.", example: "medium" }),
  actor: z
    .object({
      type: z
        .enum(AUDIT_ACTOR_TYPES)
        .meta({ description: "The kind of actor that performed the action.", example: "user" }),
      id: z.string().meta({
        description: "A user ID, `anonymous` for signed-out visitors, or the name of a system job.",
      }),
      displayName: z.string().nullable().meta({
        description: "The display name of the actor when the action was recorded, if any.",
      }),
      impersonating: z
        .string()
        .nullable()
        .meta({ description: "The ID of the user an admin was impersonating, if any." }),
      user: userSummarySchema.nullable().meta({
        description: "The current account of the actor, when the actor is an existing user.",
      }),
    })
    .meta({ description: "Who performed the action." }),
  target: z
    .looseObject({
      type: z.string().meta({ description: "The kind of resource.", example: "media" }),
      id: z.string().meta({ description: "The ID of the resource." }),
    })
    .nullable()
    .meta({
      description: "The resource the action was performed on, with action-specific fields, if any.",
    }),
  reason: z.string().nullable().meta({
    description: "The error code of a failed or denied action, or the stated reason, if any.",
  }),
  changes: z
    .object({
      before: z.unknown().optional().meta({ description: "The changed fields before the update." }),
      after: z.unknown().optional().meta({ description: "The changed fields after the update." }),
      patch: z
        .object({
          op: z.enum(["add", "remove", "replace"]).meta({ description: "The kind of change." }),
          path: z.string().meta({ description: "The JSON Pointer of the changed field." }),
          value: z
            .unknown()
            .optional()
            .meta({ description: "The new value, for `add` and `replace`." }),
        })
        .array()
        .optional()
        .meta({ description: "The changes as JSON Patch operations." }),
    })
    .nullable()
    .meta({ description: "The changed fields of an update, before and after, if any." }),
  context: z
    .object({
      requestId: z.string().nullable().meta({ description: "The ID of the HTTP request, if any." }),
      ip: z.string().nullable().meta({ description: "The IP address of the caller, if known." }),
      userAgent: z
        .string()
        .nullable()
        .meta({ description: "The browser or client that sent the request, if known." }),
    })
    .meta({ description: "Where the action came from." }),
  request: z
    .object({
      method: z.string().meta({ description: "The HTTP method.", example: "POST" }),
      path: z.string().meta({ description: "The HTTP path.", example: "/medias" }),
      status: z
        .int()
        .nullable()
        .meta({ description: "The HTTP status of the response, if known.", example: 201 }),
      duration: z
        .string()
        .nullable()
        .meta({ description: "How long the request took, if known.", example: "48ms" }),
    })
    .nullable()
    .meta({ description: "The HTTP request that performed the action, if any." }),
  preview: z
    .object({
      kind: z
        .enum(["media", "group", "staff", "user"])
        .meta({ description: "The kind of resource shown.", example: "media" }),
      id: z.uuid().meta({ description: "The ID of the resource shown." }),
      label: z.string().nullable().meta({
        description: "The title, name or display name of the resource, if any.",
        example: "Chainsaw Man",
      }),
      image: z.url().nullable().meta({
        description: "The URL of the cover, logo, photo or avatar of the resource, if any.",
      }),
      nameEffect: z
        .string()
        .nullable()
        .meta({ description: "The name effect the user has equipped, for a user preview." }),
      avatarBorder: z
        .string()
        .nullable()
        .meta({ description: "The avatar border the user has equipped, for a user preview." }),
      username: z
        .string()
        .nullable()
        .meta({ description: "The username of the user, for a user preview." }),
    })
    .nullable()
    .meta({
      description:
        "The media, group, staff member or user the entry is about, for display, if any. An entry about a chapter shows its media.",
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
    "users.nameEffect as actorNameEffect",
    "users.avatarBorder as actorAvatarBorder",
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
            nameEffect: row.actorNameEffect,
            avatarBorder: row.actorAvatarBorder,
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
