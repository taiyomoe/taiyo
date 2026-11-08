import type { Session } from "@taiyomoe/auth/server"
import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import {
  ACHIEVEMENT_METRICS,
  COSMETIC_KINDS,
  COSMETIC_RARITIES,
  type CosmeticDefinition,
} from "@taiyomoe/db/cosmetics"
import z from "zod"

export const isImpersonating = (session: Session["session"]) =>
  "impersonatedBy" in session &&
  typeof session.impersonatedBy === "string" &&
  session.impersonatedBy !== ""

export const spendPoints = async (db: Kysely<DB>, userId: string, amount: number) => {
  const row = await db
    .updateTable("userProfiles")
    .set({ points: sql<number>`"points" - ${amount}` })
    .where("userId", "=", userId)
    .where("points", ">=", amount)
    .returning("points")
    .executeTakeFirst()

  return row?.points ?? null
}

export const creditPoints = async (db: Kysely<DB>, userId: string, amount: number) => {
  const row = await db
    .updateTable("userProfiles")
    .set({ points: sql<number>`"points" + ${amount}` })
    .where("userId", "=", userId)
    .returning("points")
    .executeTakeFirstOrThrow()

  return row.points
}

export const grantCosmetic = async (
  db: Kysely<DB>,
  userId: string,
  kind: CosmeticKind,
  key: string,
) => {
  const row = await db
    .insertInto("userCosmetics")
    .values({ userId, kind, key })
    .onConflict((oc) => oc.columns(["userId", "kind", "key"]).doNothing())
    .returning("key")
    .executeTakeFirst()

  return row !== undefined
}

export const getPointBalance = async (db: Kysely<DB>, userId: string) => {
  const row = await db
    .selectFrom("userProfiles")
    .select("points")
    .where("userId", "=", userId)
    .executeTakeFirst()

  return row?.points ?? 0
}

export const cosmeticUnlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("free") }),
  z.object({ type: z.literal("role"), roles: z.string().array() }),
  z.object({
    type: z.literal("achievement"),
    metric: z.enum(ACHIEVEMENT_METRICS),
    threshold: z.number().int(),
  }),
  z.object({ type: z.literal("shop"), price: z.number().int() }),
  z.object({ type: z.literal("lootBox") }),
])

export const cosmeticRefSchema = z.object({
  kind: z.enum(COSMETIC_KINDS),
  key: z.string(),
  rarity: z.enum(COSMETIC_RARITIES),
})

export const describeCosmetic = (definition: CosmeticDefinition) => ({
  rarity: definition.rarity,
  unlock: definition.unlock,
})
