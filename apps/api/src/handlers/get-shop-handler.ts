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
import { getCosmeticProgress } from "../utils/cosmetic-progress"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { cosmeticUnlockSchema, getPointBalance } from "../utils/shop"

const shopSchema = z.object({
  balance: z.number().int().meta({ description: "Your spendable points." }),
  equipped: z.object({
    nameEffect: z.enum(NAME_EFFECT_KEYS).nullable(),
    title: z.enum(USER_TITLE_KEYS).nullable(),
    avatarBorder: z.enum(AVATAR_BORDER_KEYS).nullable(),
  }),
  items: z
    .object({
      kind: z.enum(COSMETIC_KINDS),
      key: z.string(),
      rarity: z.enum(COSMETIC_RARITIES),
      unlock: cosmeticUnlockSchema,
      owned: z.boolean(),
      unlocked: z.boolean(),
    })
    .array(),
  lootBoxes: z
    .object({
      key: z.enum(LOOT_BOX_KEYS),
      price: z.number().int(),
      duplicateRefund: z.number().int(),
      owned: z.number().int().meta({ description: "How many of the box's items you own." }),
      total: z.number().int().meta({ description: "How many items the box can drop." }),
      odds: z
        .object({
          rarity: z.enum(COSMETIC_RARITIES),
          chance: z.number().meta({ description: "The chance to roll this rarity, from 0 to 1." }),
          items: z.number().int(),
        })
        .array(),
    })
    .array(),
})

export const getShopHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "Browse the shop",
    description:
      "Lists every cosmetic with its price or unlock rule and whether you own it, the loot boxes with their exact drop odds, and your point balance.\n\nA loot box rolls a rarity by its weights, then one item of that rarity uniformly. A duplicate refunds part of the price.\n\n**Authentication:** signed-in user.",
    tags: ["Shop"],
    responses: {
      200: {
        description: "The shop.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(shopSchema)) } },
      },
      ...getOpenApiResponses({}),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user, actor } = c.var
    const [balance, progress, owned, equipped] = await Promise.all([
      getPointBalance(db, user.id),
      getCosmeticProgress(db, user.id),
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
            progress,
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
