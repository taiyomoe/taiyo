import { shopAudit } from "@taiyomoe/audit"
import { COSMETIC_KINDS, getCosmeticDefinition } from "@taiyomoe/db/cosmetics"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { cosmeticRefSchema, grantCosmetic, isImpersonating, spendPoints } from "../utils/shop"

const bodySchema = z.object({
  kind: z.enum(COSMETIC_KINDS).meta({ description: "The kind of cosmetic to buy." }),
  key: z.string().min(1).max(64).meta({ description: "The cosmetic's key.", example: "solar" }),
})
const purchaseSchema = z.object({
  item: cosmeticRefSchema,
  price: z.number().int(),
  balance: z.number().int().meta({ description: "Your points after the purchase." }),
})

export const purchaseShopItemHandler = new Hono().post(
  "/purchases",
  describeRoute({
    summary: "Buy a cosmetic",
    description:
      "Buys a cosmetic sold in the shop with your points. Cosmetics that unlock through a role, an achievement or a loot box can't be bought.\n\n**Authentication:** signed-in user, not while impersonating.",
    tags: ["Shop"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Cosmetic bought.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(purchaseSchema)) } },
      },
      ...getOpenApiResponses({
        403: "You are impersonating this user.",
        404: "No cosmetic with this kind and key exists.",
        409: "The cosmetic isn't for sale, you already own it, or you don't have enough points.",
        422: "The request data failed validation.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(shopAudit.ITEM_PURCHASE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  rateLimit({ prefix: "shop-purchase", windowMs: 60_000, limit: 20 }),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user, session } = c.var
    const { kind, key } = c.var.json
    const definition = getCosmeticDefinition(kind, key)

    c.var.audit.set({ target: { kind, key } })

    if (isImpersonating(session)) {
      return c.fail("SHOP_IMPERSONATION")
    }

    if (definition === undefined) {
      return c.fail("NOT_FOUND")
    }

    if (definition.unlock.type !== "shop") {
      return c.fail("NOT_FOR_SALE")
    }

    const { price } = definition.unlock

    if (!(await grantCosmetic(db, user.id, kind, key))) {
      return c.fail("ALREADY_OWNED")
    }

    const balance = await spendPoints(db, user.id, price)

    if (balance === null) {
      return c.fail("INSUFFICIENT_POINTS")
    }

    await db
      .insertInto("shopPurchases")
      .values({ userId: user.id, type: "ITEM", cosmeticKind: kind, cosmeticKey: key, price })
      .execute()

    c.var.audit.set({ target: { price, balance } })

    return c.ok({ item: { kind, key, rarity: definition.rarity }, price, balance })
  },
)
