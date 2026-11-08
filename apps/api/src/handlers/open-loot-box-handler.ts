import { shopAudit } from "@taiyomoe/audit"
import { LOOT_BOX_KEYS, LOOT_BOX_POOL, LOOT_BOXES, rollLootBox } from "@taiyomoe/db/loot-boxes"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { randomInt } from "node:crypto"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import {
  cosmeticRefSchema,
  creditPoints,
  grantCosmetic,
  isImpersonating,
  spendPoints,
} from "../utils/shop"

const paramSchema = z.object({
  box: z.enum(LOOT_BOX_KEYS).meta({ description: "The loot box to open." }),
})
const openingSchema = z.object({
  box: z.enum(LOOT_BOX_KEYS),
  item: cosmeticRefSchema,
  duplicate: z.boolean().meta({ description: "Whether you already owned the item." }),
  refund: z.number().int().meta({ description: "Points refunded for a duplicate." }),
  balance: z.number().int().meta({ description: "Your points after the opening." }),
})

export const openLootBoxHandler = new Hono().post(
  "/loot-boxes/:box/open",
  describeRoute({
    summary: "Open a loot box",
    description:
      "Buys and opens a loot box. The server rolls a rarity by the box's weights, then one item of that rarity uniformly, using a cryptographically secure generator. Rolling an item you already own refunds part of the price.\n\n**Authentication:** signed-in user, not while impersonating.",
    tags: ["Shop"],
    responses: {
      201: {
        description: "Loot box opened.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(openingSchema)) } },
      },
      ...getOpenApiResponses({
        403: "You are impersonating this user.",
        409: "You don't have enough points, or you already own everything the box can drop.",
        422: "The loot box doesn't exist.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(shopAudit.LOOT_BOX_OPEN, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  rateLimit({ prefix: "shop-loot-box", windowMs: 60_000, limit: 30 }),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user, session } = c.var
    const { box } = c.var.param
    const { price, duplicateRefund } = LOOT_BOXES[box]

    c.var.audit.set({ target: { box } })

    if (isImpersonating(session)) {
      return c.fail("SHOP_IMPERSONATION")
    }

    const owned = await db
      .selectFrom("userCosmetics")
      .select(["kind", "key"])
      .where("userId", "=", user.id)
      .execute()
    const ownedKeys = new Set(owned.map((row) => `${row.kind}:${row.key}`))
    const pool = LOOT_BOX_POOL.filter((item) => LOOT_BOXES[box].weights[item.rarity] > 0)

    if (pool.every((item) => ownedKeys.has(`${item.kind}:${item.key}`))) {
      return c.fail("LOOT_BOX_EXHAUSTED")
    }

    const spent = await spendPoints(db, user.id, price)

    if (spent === null) {
      return c.fail("INSUFFICIENT_POINTS")
    }

    const item = rollLootBox(box, randomInt)
    const duplicate = !(await grantCosmetic(db, user.id, item.kind, item.key))
    const refund = duplicate ? duplicateRefund : 0
    const balance = refund > 0 ? await creditPoints(db, user.id, refund) : spent

    await db
      .insertInto("shopPurchases")
      .values({
        userId: user.id,
        type: "LOOT_BOX",
        lootBox: box,
        cosmeticKind: item.kind,
        cosmeticKey: item.key,
        price,
        refund,
        duplicate,
      })
      .execute()

    c.var.audit.set({ target: { price, item: `${item.kind}:${item.key}`, duplicate, balance } })

    return c.ok({ box, item, duplicate, refund, balance })
  },
)
