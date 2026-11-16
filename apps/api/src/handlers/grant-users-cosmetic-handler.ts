import { adminAudit } from "@taiyomoe/audit"
import { COSMETIC_KINDS, getCosmeticDefinition } from "@taiyomoe/db/cosmetics"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"

const grantUsersCosmeticSchema = z
  .object({
    userIds: bulkIdsSchema("users", [
      "0d3c5b9e-7f1a-4c2e-9b8d-6a5f4e3d2c1b",
      "a7e2f9c4-1b3d-4e5f-8a6b-9c0d1e2f3a4b",
    ]),
    kind: z
      .enum(COSMETIC_KINDS)
      .meta({ description: "The kind of cosmetic to give.", example: "NAME_EFFECT" }),
    key: z.string().meta({
      description: "The key of the cosmetic to give, among the cosmetics of its `kind`.",
      example: "sakura",
    }),
    equip: z.boolean().default(false).meta({
      description: "Whether the users also wear the cosmetic right away, in place of theirs.",
      example: true,
    }),
  })
  .refine(({ kind, key }) => getCosmeticDefinition(kind, key) !== undefined, {
    message: "No cosmetic of this kind has this key.",
    path: ["key"],
  })
const skippedUserSchema = skippedSchema(
  "user",
  ["NOT_FOUND"],
  "Why the user was left alone: it does not exist.",
)

export const grantUsersCosmeticHandler = new Hono().post(
  "/cosmetics",
  describeRoute({
    summary: "Give a cosmetic to users in bulk",
    description:
      "Gives a name effect, avatar border or profile title to several users at once, who can then equip it whatever its unlock condition. Users who already own it keep it. With `equip`, the users also wear it right away. Users that do not exist are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Users"],
    responses: {
      201: {
        description: "The users given the cosmetic and the skipped ones.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("users", "given the cosmetic", skippedUserSchema),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(adminAudit.COSMETIC_GRANT_MANY),
  withAuth("user.grant"),
  validateJson(grantUsersCosmeticSchema),
  withTransaction,
  async (c) => {
    const { auth, db } = c.var
    const { userIds, kind, key, equip } = c.var.json
    const rows = await db
      .selectFrom("users")
      .select("id")
      .where("id", "in", userIds)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(userIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db
        .insertInto("userCosmetics")
        .values(done.map((userId) => ({ userId, kind, key })))
        .onConflict((oc) => oc.columns(["userId", "kind", "key"]).doNothing())
        .execute()
    }

    if (equip && done.length > 0) {
      if (kind === "TITLE") {
        await db
          .insertInto("userProfiles")
          .values(done.map((userId) => ({ userId, title: key })))
          .onConflict((oc) => oc.column("userId").doUpdateSet({ title: key }))
          .execute()
      } else {
        await db
          .updateTable("users")
          .set(kind === "NAME_EFFECT" ? { nameEffect: key } : { avatarBorder: key })
          .where("id", "in", done)
          .execute()

        c.var.afterCommit(async () => {
          await Promise.all(done.map((id) => refreshUserSessions(auth, id)))
        })
      }
    }

    c.var.audit.set({ changes: { after: { userIds: done, kind, key, equip } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
