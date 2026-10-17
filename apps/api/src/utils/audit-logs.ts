import type { AuditChanges, AuditTarget } from "evlog"
import {
  AUDIT_ACTOR_TYPES,
  AUDIT_OUTCOMES,
  AUDIT_SEVERITIES,
  type DB,
  type Kysely,
  sql,
} from "@taiyomoe/db"
import z from "zod"

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
})

export const fromAuditLogs = (db: Kysely<DB>) =>
  db
    .selectFrom("auditLogs")
    .leftJoin("users", (join) =>
      join.on(sql<boolean>`${sql.ref("users.id")}::text = ${sql.ref("auditLogs.actorId")}`),
    )

export const selectAuditLogs = (query: ReturnType<typeof fromAuditLogs>) =>
  query.select([
    "auditLogs.id",
    "auditLogs.createdAt",
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
