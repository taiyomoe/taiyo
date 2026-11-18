import type { Session } from "@taiyomoe/auth/server"
import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import { type DB, type Kysely, ROLES, sql } from "@taiyomoe/db"
import { ACHIEVEMENT_KEYS } from "@taiyomoe/db/achievements"
import { COSMETIC_KINDS, COSMETIC_RARITIES } from "@taiyomoe/db/cosmetics"
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

export const cosmeticUnlockSchema = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("free").meta({ description: "Every user has the cosmetic." }) }),
    z.object({
      type: z.literal("role").meta({ description: "The cosmetic comes with a role." }),
      roles: z
        .enum(ROLES)
        .array()
        .meta({
          description: "The roles that unlock the cosmetic.",
          example: ["MODERATOR", "ADMIN"],
        }),
    }),
    z.object({
      type: z
        .literal("achievement")
        .meta({ description: "The cosmetic comes with an achievement." }),
      achievement: z
        .enum(ACHIEVEMENT_KEYS)
        .meta({ description: "The key of the achievement.", example: "chaptersRead100" }),
    }),
    z.object({
      type: z.literal("shop").meta({ description: "The cosmetic is bought with points." }),
      price: z.int().meta({ description: "The price of the cosmetic, in points.", example: 500 }),
    }),
    z.object({
      type: z.literal("lootBox").meta({ description: "The cosmetic only drops from loot boxes." }),
    }),
  ])
  .meta({ description: "How the cosmetic is unlocked." })

export const cosmeticRefSchema = z.object({
  kind: z
    .enum(COSMETIC_KINDS)
    .meta({ description: "The kind of cosmetic.", example: "NAME_EFFECT" }),
  key: z.string().meta({ description: "The key of the cosmetic.", example: "sakura" }),
  rarity: z
    .enum(COSMETIC_RARITIES)
    .meta({ description: "The rarity of the cosmetic.", example: "rare" }),
})
