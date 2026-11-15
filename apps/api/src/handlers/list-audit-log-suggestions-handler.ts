import { auditActions, auditTargetTypes } from "@taiyomoe/audit"
import { getAuditLogField } from "@taiyomoe/audit/query"
import { type RawBuilder, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const LIMIT = 10
const RECENT_DAYS = 30
const auditCategories = [...new Set(auditActions.map((action) => action.split(".")[0] ?? action))]
const querySchema = z.object({
  field: z
    .string()
    .transform((value, ctx) => {
      const field = getAuditLogField(value)

      if (field === undefined) {
        ctx.addIssue({ code: "custom", message: "Unknown field." })

        return z.NEVER
      }

      return field
    })
    .meta({ description: "The KQL field to suggest values for.", example: "actor" }),
  query: z.string().max(200).default("").meta({
    description: "What has been typed so far, up to 200 characters. Defaults to an empty string.",
    example: "adm",
  }),
})
const suggestionSchema = z.object({
  value: z
    .string()
    .meta({ description: "The value to insert into the query.", example: "media.CREATE" }),
  label: z
    .string()
    .nullable()
    .meta({ description: "A friendlier name to show, for users.", example: "Kaito" }),
  image: z.string().nullable().meta({ description: "The URL of the avatar to show, for users." }),
  nameEffect: z
    .string()
    .nullable()
    .meta({ description: "The name effect the user has equipped, for users." }),
  avatarBorder: z
    .string()
    .nullable()
    .meta({ description: "The avatar border the user has equipped, for users." }),
})
const event = sql.ref("auditLogs.event")
const columns: Record<string, RawBuilder<unknown>> = {
  "actor.impersonating": sql`${event}->'audit'->'actor'->>'impersonating'`,
  target: sql.ref("auditLogs.targetId"),
  "target.id": sql.ref("auditLogs.targetId"),
  reason: sql.ref("auditLogs.reason"),
  ip: sql.ref("auditLogs.ip"),
  userAgent: sql.ref("auditLogs.userAgent"),
  requestId: sql.ref("auditLogs.requestId"),
  path: sql`${event}->>'path'`,
  id: sql`${sql.ref("auditLogs.id")}::text`,
  changed: sql`jsonb_object_keys(${event}->'audit'->'changes'->'after')`,
}
const contains = (query: string) => (value: string) =>
  value.toLowerCase().includes(query.toLowerCase())
const startsWith = (query: string) => (value: string) =>
  value.toLowerCase().startsWith(query.toLowerCase())
const plain = (values: readonly string[], match: (value: string) => boolean) =>
  values
    .filter(match)
    .slice(0, 50)
    .map((value) => ({ value, label: null, image: null, nameEffect: null, avatarBorder: null }))

export const listAuditLogSuggestionsHandler = new Hono().get(
  "/suggestions",
  describeRoute({
    summary: "List audit log value suggestions",
    description: `Lists values for a KQL field that match what has been typed: the allowed values of enum fields, known actions, categories and resource types, users and other actors whose name starts with it, and the most frequent values of the last ${RECENT_DAYS} days for everything else. Number and date fields get no suggestions.\n\n**Required roles:** admin.`,
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "The matching values.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(suggestionSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("auditLog.read"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { field, query } = c.var.query

    if (field.values !== undefined) {
      return c.ok(plain(field.values, contains(query)))
    }

    if (field.type === "number" || field.type === "date") {
      return c.ok([])
    }

    if (field.name === "action") {
      return c.ok(plain(auditActions, contains(query)))
    }

    if (field.name === "category") {
      return c.ok(plain(auditCategories, contains(query)))
    }

    if (field.name === "target.type") {
      return c.ok(plain([...auditTargetTypes, "auditLog"], contains(query)))
    }

    if (field.name === "actor" || field.name === "actor.id") {
      const pattern = `${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`
      const [users, others] = await Promise.all([
        db
          .selectFrom("users")
          .select(["id", "username", "displayUsername", "image", "nameEffect", "avatarBorder"])
          .where((eb) =>
            eb.or([eb("username", "ilike", pattern), eb("displayUsername", "ilike", pattern)]),
          )
          .orderBy("username")
          .limit(LIMIT)
          .execute(),
        db
          .selectFrom("auditLogs")
          .select("actorId")
          .distinct()
          .where("actorType", "!=", "user")
          .where("actorId", "ilike", pattern)
          .limit(LIMIT)
          .execute(),
      ])
      const byId = field.name === "actor.id"

      return c.ok([
        ...users.map((user) => ({
          value: byId ? user.id : user.username,
          label: user.displayUsername,
          image: user.image,
          nameEffect: user.nameEffect,
          avatarBorder: user.avatarBorder,
        })),
        ...plain(["anonymous", ...others.map(({ actorId }) => actorId)], startsWith(query)),
      ])
    }

    const column =
      columns[field.name] ??
      sql`${event}->'audit'->'target'->>${field.name.slice("target.".length)}`
    const { rows } = await sql<{ value: string }>`
      select value from (
        select ${column}::text as value
        from ${sql.table("auditLogs")}
        where ${sql.ref("auditLogs.createdAt")} > now() at time zone 'UTC' - ${`${RECENT_DAYS} days`}::interval
      ) as recent
      where value is not null and value ilike ${`%${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`}
      group by value
      order by count(*) desc, value
      limit ${LIMIT}
    `.execute(db)

    return c.ok(
      rows.map(({ value }) => ({
        value,
        label: null,
        image: null,
        nameEffect: null,
        avatarBorder: null,
      })),
    )
  },
)
