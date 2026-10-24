import { sql } from "@taiyomoe/db"
import { ROLES } from "@taiyomoe/permissions"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { isBannedSql, managedUserSchema } from "../utils/user-moderation"

const querySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .meta({ description: "Only list users whose username contains this text." }),
  role: z.enum(ROLES).optional().meta({ description: "Only list users with this role." }),
  banned: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
    .meta({ description: "Only list banned, or not banned, users." }),
})

export const listUsersHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List users",
    description:
      "Lists users for moderation, newest first, with their role and ban. Email addresses are only returned to admins.\n\n**Required roles:** moderator, admin.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Matching users.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedUserSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("user.list"),
  validateQuery(querySchema),
  async (c) => {
    const { actor, db } = c.var
    const { page, perPage, search, role, banned } = c.var.query
    const pattern = search === undefined ? null : `%${search.replace(/[\\%_]/g, "\\$&")}%`
    const base = db
      .selectFrom("users")
      .select([
        "users.id",
        "users.username",
        "users.displayUsername",
        "users.image",
        "users.role",
        "users.banReason",
        "users.email",
        "users.createdAt",
        isBannedSql.as("banned"),
        sql<string | null>`to_char("users"."banExpires", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
          "banExpires",
        ),
      ])
      .where((eb) =>
        pattern === null
          ? eb.and([])
          : eb.or([
              eb("users.username", "ilike", pattern),
              eb("users.displayUsername", "ilike", pattern),
            ]),
      )
      .where((eb) => (role === undefined ? eb.and([]) : eb("users.role", "=", role)))
      .where((eb) => {
        if (banned === undefined) {
          return eb.and([])
        }

        return banned ? eb(isBannedSql, "=", true) : eb(isBannedSql, "=", false)
      })
    const [rows, totalRow] = await Promise.all([
      base
        .orderBy("users.createdAt", "desc")
        .orderBy("users.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base
        .clearSelect()
        .select(sql<string>`count(*)`.as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(
      rows.map((row) => ({ ...row, email: actor.role === "ADMIN" ? row.email : null })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
