import {
  AVATAR_BORDER_KEYS,
  COSMETIC_CATALOG,
  COSMETIC_KINDS,
  COSMETIC_RARITIES,
  isCosmeticUnlocked,
  NAME_EFFECT_KEYS,
  USER_TITLE_KEYS,
} from "@taiyomoe/db/cosmetics"
import { getLootBoxOdds, LOOT_BOX_KEYS, LOOT_BOXES } from "@taiyomoe/db/loot-boxes"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getHeldAchievements } from "../utils/achievements"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { cosmeticUnlockSchema, getPointBalance } from "../utils/shop"

const shopSchema = z.object({
  balance: z.int().meta({ description: "The number of points you can spend.", example: 1250 }),
  equipped: z
    .object({
      nameEffect: z
        .enum(NAME_EFFECT_KEYS)
        .nullable()
        .meta({ description: "The name effect you have equipped, if any.", example: "gold" }),
      title: z
        .enum(USER_TITLE_KEYS)
        .nullable()
        .meta({ description: "The title you have equipped, if any." }),
      avatarBorder: z
        .enum(AVATAR_BORDER_KEYS)
        .nullable()
        .meta({ description: "The avatar border you have equipped, if any." }),
    })
    .meta({ description: "The cosmetics you have equipped." }),
  items: z
    .object({
      kind: z.enum(COSMETIC_KINDS).meta({ description: "The kind of cosmetic." }),
      key: z.string().meta({ description: "The key of the cosmetic.", example: "sakura" }),
      rarity: z
        .enum(COSMETIC_RARITIES)
        .meta({ description: "The rarity of the cosmetic.", example: "rare" }),
      unlock: cosmeticUnlockSchema,
      owned: z.boolean().meta({ description: "Whether you own the cosmetic." }),
      unlocked: z.boolean().meta({
        description:
          "Whether you can equip the cosmetic: you own it, it is free, you have its role, or you hold its achievement.",
      }),
    })
    .array()
    .meta({ description: "Every cosmetic, by kind." }),
  lootBoxes: z
    .object({
      key: z.enum(LOOT_BOX_KEYS).meta({ description: "The key of the loot box.", example: "gold" }),
      price: z.int().meta({ description: "The price of the loot box, in points.", example: 750 }),
      duplicateRefund: z.int().meta({
        description: "The points refunded when the box drops a cosmetic you already own.",
        example: 300,
      }),
      owned: z.int().meta({
        description: "The number of cosmetics the box can drop that you own.",
        example: 4,
      }),
      total: z
        .int()
        .meta({ description: "The number of cosmetics the box can drop.", example: 18 }),
      odds: z
        .object({
          rarity: z
            .enum(COSMETIC_RARITIES)
            .meta({ description: "The rarity rolled.", example: "epic" }),
          chance: z
            .number()
            .meta({ description: "The chance to roll this rarity, from 0 to 1.", example: 0.24 }),
          items: z.int().meta({
            description: "The number of cosmetics of this rarity the box can drop.",
            example: 6,
          }),
        })
        .array()
        .meta({ description: "The drop odds of each rarity the box can drop." }),
    })
    .array()
    .meta({ description: "Every loot box." }),
})

export const getShopHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "Get the shop",
    description:
      "Returns every cosmetic with its unlock rule and whether you own it, the loot boxes with their exact drop odds, and your point balance. A loot box rolls a rarity by its odds, then one cosmetic of that rarity uniformly, and a duplicate refunds part of the price.\n\n**Authentication:** signed-in user.",
    tags: ["Shop"],
    responses: {
      200: {
        description: "The shop.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(shopSchema)) } },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user, actor } = c.var
    const [balance, achievements, owned, equipped] = await Promise.all([
      getPointBalance(db, user.id),
      getHeldAchievements(db, user.id),
      db
        .selectFrom("userCosmetics")
        .select(["kind", "key"])
        .where("userId", "=", user.id)
        .execute(),
      db
        .selectFrom("users")
        .leftJoin("userProfiles", "userProfiles.userId", "users.id")
        .select(["users.nameEffect", "users.avatarBorder", "userProfiles.title"])
        .where("users.id", "=", user.id)
        .executeTakeFirstOrThrow(),
    ])
    const ownedKeys = new Set(owned.map((row) => `${row.kind}:${row.key}`))
    const items = COSMETIC_KINDS.flatMap((kind) =>
      Object.entries(COSMETIC_CATALOG[kind]).map(([key, definition]) => {
        const isOwned = ownedKeys.has(`${kind}:${key}`)

        return {
          kind,
          key,
          rarity: definition.rarity,
          unlock: definition.unlock,
          owned: isOwned,
          unlocked: isCosmeticUnlocked(definition.unlock, {
            role: actor.role,
            owned: isOwned,
            achievements,
          }),
        }
      }),
    )

    return c.ok({
      balance,
      equipped: {
        nameEffect: NAME_EFFECT_KEYS.find((key) => key === equipped.nameEffect) ?? null,
        title: USER_TITLE_KEYS.find((key) => key === equipped.title) ?? null,
        avatarBorder: AVATAR_BORDER_KEYS.find((key) => key === equipped.avatarBorder) ?? null,
      },
      items,
      lootBoxes: LOOT_BOX_KEYS.map((key) => {
        const odds = getLootBoxOdds(key)
        const pool = odds.flatMap((entry) => entry.items)

        return {
          key,
          price: LOOT_BOXES[key].price,
          duplicateRefund: LOOT_BOXES[key].duplicateRefund,
          owned: pool.filter((item) => ownedKeys.has(`${item.kind}:${item.key}`)).length,
          total: pool.length,
          odds: odds.map((entry) => ({
            rarity: entry.rarity,
            chance: entry.chance,
            items: entry.items.length,
          })),
        }
      }),
    })
  },
)
